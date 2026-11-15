import test from 'node:test';
import assert from 'node:assert/strict';
import { generateRecipe } from '../server/generate.js';
const recipe = { title:'Rice',description:'Lunch',servings:2,minutes:20,ingredients:[{name:'Rice',quantity:100,unit:'g',note:''}],steps:[{text:'Cook the rice.',timerSeconds:600}] };
const env={GROQ_API_KEY:'test-key',GROQ_MODEL:'test-model'};
const completion = content => new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content}}]}),{status:200});
test('missing server credentials and invalid prompts fail before calling a provider', async () => {
  const fetchImpl=()=>assert.fail('Must not call provider');
  await assert.rejects(generateRecipe({prompt:'rice'},{env:{},fetchImpl}),e=>e.status===503);
  await assert.rejects(generateRecipe({prompt:'x'},{env,fetchImpl}),e=>e.status===400);
});
test('provider receives strict schema, server key and full recipe for a refinement', async () => {
  let payload;
  const result=await generateRecipe({prompt:'Swap rice for quinoa',recipe},{env,fetchImpl:async(url,init)=>{
    assert.equal(url,'https://api.groq.com/openai/v1/chat/completions'); assert.equal(init.headers.Authorization,'Bearer test-key'); payload=JSON.parse(init.body); return completion(JSON.stringify(recipe));
  }});
  assert.equal(payload.response_format.json_schema.strict,true);
  assert.deepEqual(JSON.parse(payload.messages[1].content).existingRecipe,recipe);
  assert.deepEqual(result,recipe);
});
test('bad JSON and wrong schema return actionable errors', async () => {
  for(const raw of ['not json','{}','',JSON.stringify({...recipe,steps:[]})]) await assert.rejects(generateRecipe({prompt:'rice'},{env,fetchImpl:async()=>completion(raw)}), e=>e.status===502);
});
test('rate limits and unauthorized credentials have distinct safe errors', async () => {
  for(const [status,expected] of [[429,429],[401,503],[500,502]]) await assert.rejects(generateRecipe({prompt:'rice'},{env,fetchImpl:async()=>new Response('provider details',{status})}),e=>e.status===expected && !e.message.includes('provider details'));
});
test('network failure, timeout and cancellation are distinguished', async () => {
  await assert.rejects(generateRecipe({prompt:'rice'},{env,fetchImpl:async()=>{throw new Error('network');}}),e=>e.status===502);
  await assert.rejects(generateRecipe({prompt:'rice'},{env,fetchImpl:async()=>{throw new DOMException('timeout','TimeoutError');}}),e=>e.status===504);
  const c=new AbortController(); c.abort();
  await assert.rejects(generateRecipe({prompt:'rice'},{env,signal:c.signal,fetchImpl:async()=>{throw new DOMException('cancel','AbortError');}}),e=>e.status===499);
});
test('refusal, incomplete generation and unreadable provider envelopes are rejected', async () => {
  for (const envelope of [{choices:[{finish_reason:'length',message:{content:JSON.stringify(recipe)}}]}, {choices:[{finish_reason:'stop',message:{refusal:'no'}}]}, {}]) await assert.rejects(generateRecipe({prompt:'rice'},{env,fetchImpl:async()=>new Response(JSON.stringify(envelope),{status:200})}),e=>e.status===502);
});
