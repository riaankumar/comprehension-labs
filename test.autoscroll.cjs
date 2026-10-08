const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const url=process.env.SITE_URL||'http://127.0.0.1:8768/';
const executablePath=process.env.HOME+'/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell';
(async()=>{
 const browser=await chromium.launch({executablePath}),results=[];
 async function open(options={},path='/'){
  const page=await browser.newPage({viewport:{width:1440,height:844},...options});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install({time:new Date('2026-10-08T05:00:00Z')});
  await page.clock.pauseAt(new Date('2026-10-08T05:00:01Z'));
  await page.goto(new URL(path,url).href,{waitUntil:'networkidle'});
  return {page,errors};
 }
 async function finish(page,errors,name){
  assert.deepEqual(errors,[]);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  results.push(name);await page.close();
 }
 for(const width of [1440,390]){
  const {page,errors}=await open({viewport:{width,height:844}});
  await page.clock.fastForward(29_999);assert.equal(await page.evaluate(()=>scrollY),0,'Do not advance early');
  await page.clock.fastForward(1);await page.waitForTimeout(1800);
  assert(await page.evaluate(()=>Math.abs(scrollY-(document.documentElement.scrollHeight-innerHeight))<=2),'Reach the document bottom after 30 seconds');
  await page.clock.runFor(250);
  assert(await page.locator('#contact a').last().isVisible());
  assert.equal(await page.locator('main').evaluate(e=>e.inert),false);
  assert.equal(new URL(page.url()).pathname,'/','Do not change the URL');
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.clock.fastForward(60_000);assert.equal(await page.evaluate(()=>scrollY),0,'Run only once');
  await finish(page,errors,`${width}px: exact delay, bottom, readable content, once only`);
 }
 for(const input of ['wheel','keyboard','touch','scroll']){
  const {page,errors}=await open({hasTouch:true});
  await page.clock.fastForward(20_000);
  if(input==='wheel')await page.mouse.wheel(0,180);
  if(input==='keyboard')await page.keyboard.press('Tab');
  if(input==='touch')await page.touchscreen.tap(300,350);
  if(input==='scroll')await page.evaluate(()=>scrollTo({top:200,behavior:'instant'}));
  await page.waitForTimeout(150);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.clock.fastForward(60_000);assert.equal(await page.evaluate(()=>scrollY),0,`${input} takes priority`);
  await finish(page,errors,`${input}: cancels automatic scrolling`);
 }
 {
  const {page,errors}=await open();await page.clock.fastForward(30_000);await page.waitForTimeout(100);
  assert(await page.evaluate(()=>scrollY>0&&scrollY<document.documentElement.scrollHeight-innerHeight),'Smooth scrolling has started');
  await page.mouse.wheel(0,-60);await page.waitForTimeout(1800);
  assert(await page.evaluate(()=>scrollY<document.documentElement.scrollHeight-innerHeight-100),'Manual input interrupts the animation');
  await finish(page,errors,'Manual input interrupts an automatic scroll in progress');
 }
 for(const path of ['/contact','/#story']){
  const {page,errors}=await open({},path);await page.waitForTimeout(1800);
  const before=await page.evaluate(()=>scrollY);await page.clock.fastForward(60_000);await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>scrollY),before,'Direct links keep their destination');
  await finish(page,errors,`${path}: no automatic scroll`);
 }
 {
  const {page,errors}=await open({reducedMotion:'reduce'});await page.clock.fastForward(60_000);
  assert.equal(await page.evaluate(()=>scrollY),0);await finish(page,errors,'Reduced motion: no automatic scroll');
 }
 {
  const {page,errors}=await open();await page.clock.fastForward(20_000);await page.emulateMedia({reducedMotion:'reduce'});
  await page.clock.runFor(20);await page.clock.fastForward(60_000);
  assert.equal(await page.evaluate(()=>scrollY),0);await finish(page,errors,'Enabling reduced motion cancels the pending scroll');
 }
 {
  const {page,errors}=await open();await page.clock.fastForward(20_000);
  const visibility=async hidden=>page.evaluate(hidden=>{
   Object.defineProperty(document,'hidden',{configurable:true,get:()=>hidden});
   document.dispatchEvent(new Event('visibilitychange'));
  },hidden);
  await visibility(true);await page.clock.fastForward(60_000);assert.equal(await page.evaluate(()=>scrollY),0);
  await visibility(false);await page.clock.fastForward(29_999);assert.equal(await page.evaluate(()=>scrollY),0);
  await page.clock.fastForward(1);await page.waitForTimeout(1800);
  assert(await page.evaluate(()=>Math.abs(scrollY-(document.documentElement.scrollHeight-innerHeight))<=2));
  await finish(page,errors,'Hidden tab: no scroll, fresh 30 seconds on return');
 }
 await browser.close();fs.mkdirSync('screenshots',{recursive:true});
 fs.writeFileSync('screenshots/auto-scroll-checks.json',JSON.stringify({url,results},null,2));console.log('PASS',results);
})().catch(e=>{console.error(e);process.exit(1)});
