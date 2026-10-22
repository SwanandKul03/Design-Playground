(async function () {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clamp=(n,a,b)=>Math.min(b,Math.max(a,Number(n)||0)), cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
  const uid=()=>typeof crypto.randomUUID==='function'?crypto.randomUUID():'item-'+Array.from(crypto.getRandomValues(new Uint32Array(4)),n=>n.toString(16)).join('-');
  const HEX=/^#[0-9a-f]{6}([0-9a-f]{2})?$/i, STORAGE='design-playground-slate-v2';
  const buttonStates=['default','hover','focused','pressed','disabled'], inputStates=['default','focused','error','disabled'], sizes=[128,96,72,60,48,24,18,16,14,12];
  let raw;
  try {const r=await fetch('assets/tokens.json');if(!r.ok)throw Error();raw=await r.json();}
  catch {$('#page-toast').textContent='The colour data could not load. Please refresh to try again.';$('#page-toast').classList.add('visible');$$('[data-open-playground]').forEach(b=>b.disabled=true);return;}
  const original={},tokens=[];
  Object.entries(raw).forEach(([collection,modes])=>Object.entries(modes.mode1).forEach(([name,value])=>{const key=collection+'.'+name;original[key]=value;tokens.push({key,name,value,collection});}));
  const kp=n=>'primitives.'+n, ks=n=>'colorSymanticTokens.'+n, primitives=raw.primitives.mode1;
  const editor=$('#editor'), stage=$('#canvas'), viewport=$('#canvas-viewport');
  let selected=null,tool='select',mode='arrange',zoom=.65,drawToken=kp('colorPrimaryPrimary500'),drawWidth=3,variableKey=ks('primaryButtonLargeButtonLargeDefault');
  let undoStack=[],redoStack=[],drag=null,drawing=null,saveTimer,toastTimer;
  function starter(){return {version:1,nodes:[
    {id:uid(),type:'text',x:100,y:85,w:1000,text:'A new idea',font:'heading',fontSize:96,colour:kp('colorAchromaticBlack')},
    {id:uid(),type:'input',x:100,y:270,w:400,label:'Project name',placeholder:'Enter a name',helper:'Use a short name.',value:'Enter a name',enteredValue:'',valueType:'placeholder',state:'default',showLabel:true,showHelper:true,leading:true,trailing:true,helperIcon:true,hasValue:true},
    {id:uid(),type:'button',x:100,y:470,w:260,label:'Continue',variant:'primary',size:'large',state:'default',leading:true,trailing:true},
    {id:uid(),type:'button',x:400,y:470,w:260,label:'Confirm',variant:'primary',size:'large',state:'default',leading:true,trailing:true}
  ],strokes:[],overrides:{}};}
  let state=starter();
  const get=k=>state.overrides[k]||original[k]||'#000000', P=n=>get(kp(n));
  function pretty(n){const m=n.match(/^(primary|secondary|tertiary)Button(Large|Small)Button(?:Large|Small)(Default|Hover|Focused|Pressed|Disabled)$/);return m?cap(m[1])+' · '+m[2]+' · '+m[3]:n.replace(/^color/,'').replace(/([A-Z][a-z]+)\1/,'$1').replace(/([a-z])([A-Z0-9])/g,'$1 $2');}
  const tokenFor=(n,s)=>ks(n.variant+'Button'+cap(n.size)+'Button'+cap(n.size)+cap(s));
  function buttonStyle(n,s,source=false){
    const V=k=>source?original[k]:get(k), C=name=>V(kp(name));
    const key=tokenFor(n,s);let bg=V(key),fg=C('colorAchromaticBlack'),border=C('colorAchromaticBlack');
    // Preserve raw tokens. Resolve three conflicting small-tertiary values visually.
    if(n.variant==='tertiary'&&n.size==='small'&&(source||!state.overrides[key])){
      if(s==='default'||s==='disabled')bg=C('colorAchromaticTransparent');
      if(s==='pressed')bg=C('colorNeutralNeutral300');
    }
    if(s==='pressed')fg=C('colorAchromaticWhite');
    if(n.variant==='tertiary'){
      if(['default','disabled','hover','pressed'].includes(s))border=C('colorAchromaticTransparent');
      if(s==='disabled')fg=C('colorNeutralNeutral400');
    }else if(s==='disabled'){border=C('colorNeutralNeutral300');if(n.variant==='secondary')fg=C('colorNeutralNeutral400');}
    return {bg,fg,border,focused:s==='focused'};
  }
  function arrow(left){const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('class','arrow');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');const p=document.createElementNS(s.namespaceURI,'path');p.setAttribute('d',left?'M20 12H4m7-7-7 7 7 7':'M4 12h16m-7-7 7 7-7 7');s.append(p);return s;}
  function info(){const s=document.createElement('span');s.className='info-icon';s.setAttribute('aria-hidden','true');s.textContent='!';return s;}
  function makeButton(n,interactive=false,source=false,onState=()=>{}){
    const b=document.createElement('button');b.type='button';b.className='ds-button '+n.variant+' '+n.size;b.dataset.forced=n.state;b.disabled=n.state==='disabled';
    const paint=s=>{const v=buttonStyle(n,s,source);Object.assign(b.style,{background:v.bg,color:v.fg,borderColor:v.border,boxShadow:v.focused?'0 0 0 2px '+(source?primitives.colorAchromaticBlack:P('colorAchromaticBlack')):'none'});onState(s);};paint(n.state);
    b.setAttribute('aria-label',n.label||'Button');if(n.leading)b.append(arrow(true));if(n.showText!==false){const t=document.createElement('span');t.textContent=n.label;t.className='button-content';b.append(t);}if(n.trailing)b.append(arrow(false));
    if(interactive){
      if(n.state==='default'){
        b.addEventListener('pointerenter',()=>paint('hover'));b.addEventListener('pointerleave',()=>paint(b.matches(':focus-visible')?'focused':'default'));b.addEventListener('pointerdown',()=>paint('pressed'));b.addEventListener('pointerup',()=>paint('hover'));b.addEventListener('focus',()=>paint('focused'));b.addEventListener('blur',()=>paint('default'));
        b.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter')paint('pressed');});b.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')paint('focused');});
      }
      b.addEventListener('click',()=>{if(editor.open)toast('“'+n.label+'” pressed.');else if(n.id==='demo-button')$('#button-feedback').textContent='Button pressed.';});
    }else b.tabIndex=-1;
    return b;
  }
  function makeInput(n,interactive=false,source=false,onState=()=>{}){
    const C=name=>source?primitives[name]:P(name),placeholder=n.valueType==='placeholder';
    const w=document.createElement('div');w.className='ds-field';w.dataset.state=n.state;
    const inputId='field-'+n.id,helperId='help-'+n.id;
    if(n.showLabel){const l=document.createElement('label');l.className='ds-field-label';l.htmlFor=inputId;l.textContent=n.label;w.append(l);}
    const shell=document.createElement('div');shell.className='ds-field-shell';shell.style.background=C('colorAchromaticWhite');shell.style.color=n.state==='focused'?C('colorAchromaticBlack'):n.state==='error'?C('colorErrorError300'):C('colorNeutralNeutral400');
    if(n.state==='focused')shell.style.borderColor=C('colorPrimaryPrimary600');if(n.state==='error')shell.style.borderColor=C('colorErrorError300');if(n.state==='disabled')shell.style.borderColor=C('colorNeutralNeutral300');
    const input=document.createElement('input');input.type='text';input.id=inputId;input.placeholder=placeholder?n.value:(n.placeholder||'');input.value=placeholder?(n.enteredValue||''):(n.value||'');input.maxLength=140;input.setAttribute('aria-label',n.label||'Input field');if(n.showHelper!==false&&n.helper)input.setAttribute('aria-describedby',helperId);if(n.state==='error')input.setAttribute('aria-invalid','true');input.disabled=n.state==='disabled';if(!interactive||n.hasValue===false)input.tabIndex=-1;if(n.hasValue===false){input.style.visibility='hidden';input.setAttribute('aria-hidden','true');}
    input.addEventListener('input',()=>{if(placeholder)n.enteredValue=input.value;else n.value=input.value;if(editor.open)persist();else if(n.id==='demo-input')$('#input-feedback').textContent=input.value?'Input updated.':'';});
    if(interactive){input.addEventListener('focus',()=>onState(n.state==='default'?'focused':n.state));input.addEventListener('blur',()=>onState(n.state));}
    if(n.leading!==false)shell.append(info());shell.append(input);if(n.trailing!==false)shell.append(info());w.append(shell);
    if(n.showHelper!==false&&n.helper){const help=document.createElement('div');help.className='ds-field-helper';help.id=helperId;if(n.state==='error')help.style.color=C('colorErrorError300');if(n.helperIcon!==false)help.append(info());const text=document.createElement('span');text.textContent=n.helper;help.append(text);w.append(help);}return w;
  }
  function componentSpecs(n,s=n.state,source=false){
    if(n.type==='button')return '['+n.variant+' button · '+n.size+' · '+s+' · h 48px · '+(n.showText===false?'text hidden':'text '+(n.size==='large'?18:12)+'px')+' · '+buttonStyle(n,s,source).bg.toUpperCase()+']';
    if(n.type==='input')return '[input · state '+s+' · value type '+(n.valueType||'default')+' · field 48px'+(n.hasValue===false?' · value hidden':' · value 14px')+(n.showLabel?' · label 12px':'')+(n.showHelper!==false&&n.helper?' · helper 12px':'')+']';
    return '[text · '+(n.font==='heading'?'bold':n.font==='title'?'medium':'regular')+' · '+n.fontSize+'px / '+n.fontSize+'px · '+get(n.colour).toUpperCase()+']';
  }
  function annotated(n,interactive=false,source=false){
    const wrap=document.createElement('div');wrap.className='system-example';const spec=document.createElement('small');spec.className='component-spec';spec.textContent=componentSpecs(n,n.state,source);
    const change=s=>{spec.textContent=componentSpecs(n,s,source);};wrap.append(n.type==='button'?makeButton(n,interactive,source,change):makeInput(n,interactive,source,change),spec);return wrap;
  }
  function updateHeroSpecs(){const c=getComputedStyle($('#hero-heading'));$('#hero-spec').textContent='[heading · bold · '+Math.round(parseFloat(c.fontSize))+'px / '+Math.round(parseFloat(c.lineHeight))+'px]';}
  function renderCtas(){['hero-button','slate-button'].forEach(id=>{const n={id,type:'button',variant:'primary',size:'large',state:'default',label:'Open the slate',leading:true,trailing:true},example=annotated(n,true,true);$('button',example).addEventListener('click',openEditor);$('#'+id).replaceChildren(example);});}
  function contrastText(hex){if(hex.length===9&&parseInt(hex.slice(7,9),16)<120)return '#000000';const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return (.2126*c[0]+.7152*c[1]+.0722*c[2])>.179?'#000000':'#ffffff';}
  let selectedColour='colorSecondarySecondary500';
  function renderPalette(){
    const groups=[['Primary','colorPrimaryPrimary'],['Secondary','colorSecondarySecondary'],['Neutral','colorNeutralNeutral'],['Background','colorBackgroundBackground'],['Accent','colorAccent'],['Achromatic','colorAchromatic'],['Success','colorSuccessSuccess'],['Warning','colorWarningWarning'],['Error','colorErrorError']];
    groups.forEach(([label,prefix])=>{
      const section=document.createElement('div');section.className='palette-group'+(['Accent','Achromatic','Success','Warning','Error'].includes(label)?' compact':'');const h=document.createElement('h3');h.textContent=label;section.append(h);const row=document.createElement('div');row.className='swatch-row';
      Object.entries(primitives).filter(([n])=>n.startsWith(prefix)).sort((a,b)=>(parseInt(b[0].match(/\d+$/)?.[0])||0)-(parseInt(a[0].match(/\d+$/)?.[0])||0)).forEach(([n,v])=>{
        const b=document.createElement('button');b.className='swatch';b.style.background=v;b.style.color=contrastText(v);if(v==='#ffffff'||v.length===9)b.style.borderColor='#c5c6d3';b.setAttribute('aria-label',pretty(n)+', '+v);b.setAttribute('aria-pressed',String(n===selectedColour));b.dataset.token=n;const t=document.createElement('span');t.className='swatch-label';t.textContent=n.slice(prefix.length);b.append(t);b.addEventListener('click',()=>selectColour(n));row.append(b);
      });section.append(row);$('#palette').append(section);
    });
  }
  function selectColour(n){selectedColour=n;$$('.swatch').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.token===n)));$('#colour-name').textContent=pretty(n);$('#colour-value').textContent=primitives[n].toUpperCase();$('#colour-token').textContent='['+n+']';$('.inspector-swatch').style.background=primitives[n];}
  $('#copy-colour').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(primitives[selectedColour]);toast('Copied '+primitives[selectedColour].toUpperCase());}catch{toast('Colour value: '+primitives[selectedColour].toUpperCase());}});
  function switchTabs(buttons,current,panel){buttons.forEach(b=>{const on=b===current;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;panel(b).hidden=!on;});}
  function tabKeys(buttons,callback){buttons.forEach((b,i)=>b.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%buttons.length;if(e.key==='ArrowLeft')n=(i-1+buttons.length)%buttons.length;if(e.key==='Home')n=0;if(e.key==='End')n=buttons.length-1;if(n!==undefined){e.preventDefault();callback(buttons[n]);buttons[n].focus();}}));}
  const fTabs=$$('[data-foundation]');function fTab(b){switchTabs(fTabs,b,n=>$('#'+n.dataset.foundation+'-panel'));}fTabs.forEach(b=>b.addEventListener('click',()=>fTab(b)));tabKeys(fTabs,fTab);
  const typeRows=[['Heading 1','Heading typeface','Extra Bold',128],['Heading 2','Heading typeface','Bold',96],['Heading 3','Heading typeface','Semi Bold',72],['Heading 4','Heading typeface','Medium',60],['Heading 5','Heading typeface','Regular',48],['Title','Text typeface','Medium',24],['Sub-title','Text typeface','Medium',18],['Body','Text typeface','Regular',16],['Paragraph','Text typeface','Regular',14],['Caption','Text typeface','Regular',14],['Large button text','Text typeface','Regular',18],['Small button text','Text typeface','Regular',12]];
  $('#type-scale').innerHTML=typeRows.map(r=>'<tr><td>'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td>'+esc(r[2])+'</td><td>'+r[3]+' / '+r[3]+'px</td></tr>').join('');
  function updateType(){const f=$('#type-family').value,t=$('#type-specimen');t.style.fontFamily=f==='heading'?'SystemHeading,Arial,sans-serif':'SystemText,Arial,sans-serif';t.style.fontWeight=f==='heading'?'700':f==='title'?'500':'400';t.style.fontSize=$('#type-size').value+'px';$('#type-spec').textContent='['+(f==='heading'?'heading · bold':f==='title'?'text · medium':'text · regular')+' · '+$('#type-size').value+'px / '+$('#type-size').value+'px]';}
  $('#type-family').addEventListener('change',updateType);$('#type-size').addEventListener('change',updateType);
  function demoButton(){return {id:'demo-button',type:'button',variant:$('#button-type').value,size:$('#button-size').value,label:$('#button-label').value||'Button',state:$('#button-state').value,leading:$('#button-left').checked,trailing:$('#button-right').checked,showText:$('#button-text').checked};}
  function renderButtonDemo(){const n=demoButton();$('#button-live').replaceChildren(annotated(n,true,true));$('#button-states').replaceChildren();buttonStates.forEach(s=>{const box=document.createElement('div');box.className='state-example';box.append(annotated({...n,id:'state-'+s,label:'Button',state:s},false,true));$('#button-states').append(box);});}
  ['button-type','button-state','button-size','button-label','button-left','button-right','button-text'].forEach(id=>$('#'+id).addEventListener(id.endsWith('label')?'input':'change',renderButtonDemo));
  function demoInput(){return {id:'demo-input',type:'input',label:$('#input-label').value,helper:$('#input-helper').value,value:$('#input-value').value,enteredValue:'',valueType:$('#input-value-type').value,state:$('#input-state').value,showLabel:$('#input-has-label').checked,showHelper:$('#input-has-helper').checked,leading:$('#input-left').checked,trailing:$('#input-right').checked,helperIcon:$('#input-helper-icon').checked,hasValue:$('#input-has-value').checked};}
  function renderInputDemo(){$('#input-live').replaceChildren(annotated(demoInput(),true,true));}
  ['input-state','input-label','input-helper','input-value-type','input-value','input-has-label','input-has-helper','input-left','input-right','input-helper-icon','input-has-value'].forEach(id=>$('#'+id).addEventListener($('#'+id).tagName==='SELECT'||$('#'+id).type==='checkbox'?'change':'input',renderInputDemo));
  const snapshot=()=>JSON.stringify(state);
  function checkpoint(saved){const s=saved||snapshot();if(undoStack.at(-1)!==s)undoStack.push(s);if(undoStack.length>80)undoStack.shift();redoStack=[];historyButtons();}
  function historyButtons(){$('#undo').disabled=!undoStack.length;$('#redo').disabled=!redoStack.length;}
  function persist(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{localStorage.setItem(STORAGE,snapshot());}catch{toast('This browser could not save the slate. It will stay available for this session.');}},200);}
  function undo(){if(!undoStack.length)return;redoStack.push(snapshot());state=JSON.parse(undoStack.pop());selected=null;refresh();persist();}
  function redo(){if(!redoStack.length)return;undoStack.push(snapshot());state=JSON.parse(redoStack.pop());selected=null;refresh();persist();}
  function refresh(){renderCanvas();renderInspector();renderVariableControl();historyButtons();}
  const pathFor=points=>points.map((p,i)=>(i?'L':'M')+p[0]+','+p[1]).join(' ')+(points.length===1?'l.1,.1':'');
  function renderStrokes(){const layer=$('#drawing-layer');layer.replaceChildren();state.strokes.forEach(s=>{const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',pathFor(s.points));p.setAttribute('stroke',get(s.colour));p.setAttribute('stroke-width',s.width);p.setAttribute('fill','none');layer.append(p);});}
  function renderCanvas(){
    stage.dataset.tool=tool;stage.dataset.mode=mode;stage.style.backgroundColor=P('colorBackgroundBackground100');const container=$('#canvas-items');container.replaceChildren();if(!state.nodes.length&&!state.strokes.length){const hint=document.createElement('p');hint.className='canvas-empty';hint.textContent='Add a component, or choose Text or Draw.';container.append(hint);}
    state.nodes.forEach(n=>{
      const el=document.createElement('div');el.className='canvas-item';el.dataset.id=n.id;el.dataset.selected=String(n.id===selected&&mode==='arrange');el.setAttribute('role','group');el.setAttribute('aria-label',n.type==='text'?'Text: '+n.text:cap(n.type)+': '+n.label);el.tabIndex=mode==='arrange'?0:-1;Object.assign(el.style,{left:n.x+'px',top:n.y+'px',width:n.w+'px'});
      if(n.type==='button'||n.type==='input')el.append(annotated(n,mode==='preview'));
      if(n.type==='text'){const t=document.createElement('div');t.className='canvas-text';t.textContent=n.text;Object.assign(t.style,{fontFamily:n.font==='heading'?'SystemHeading,Arial,sans-serif':'SystemText,Arial,sans-serif',fontWeight:n.font==='heading'?'700':n.font==='title'?'500':'400',fontSize:n.fontSize+'px',color:get(n.colour)});const spec=document.createElement('small');spec.className='component-spec';spec.textContent=componentSpecs(n);el.append(t,spec);}
      el.addEventListener('focus',()=>{if(mode==='arrange'&&selected!==n.id){selected=n.id;$$('.canvas-item').forEach(i=>i.dataset.selected=String(i.dataset.id===selected));renderInspector();}});container.append(el);
    });renderStrokes();
  }
  function setZoom(n){zoom=clamp(n,.15,1.5);stage.style.transform='scale('+zoom+')';$('#canvas-scale').style.width=1200*zoom+'px';$('#canvas-scale').style.height=800*zoom+'px';$('#zoom-value').textContent=Math.round(zoom*100)+'%';}
  function fit(){const cs=getComputedStyle(viewport);setZoom(Math.min((viewport.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight))/1200,(viewport.clientHeight-60)/800,1));viewport.scrollTo(0,0);}
  function point(e){const r=stage.getBoundingClientRect();return [clamp((e.clientX-r.left)/zoom,0,1200),clamp((e.clientY-r.top)/zoom,0,800)];}
  function setMode(next){
    mode=next;$$('button[data-mode]').forEach(b=>{const on=b.dataset.mode===mode;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
    if(mode==='preview'){selected=null;tool='select';$$('button[data-tool]').forEach(b=>{const on=b.dataset.tool==='select';b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});}
    $('#canvas-hint').textContent=mode==='preview'?'Try the buttons and input fields.':'Drag to arrange. Select an item to edit.';renderCanvas();renderInspector();
  }
  function setTool(next){tool=next;if(mode==='preview')setMode('arrange');$$('button[data-tool]').forEach(b=>{const on=b.dataset.tool===tool;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});stage.dataset.tool=tool;$('#canvas-hint').textContent=tool==='draw'?'Draw on the slate.':tool==='text'?'Click the slate to add text.':'Drag to arrange. Select an item to edit.';if(tool==='draw'){selected=null;renderCanvas();}renderInspector();}
  const eTabs=$$('[data-editor-tab]');function eTab(b){switchTabs(eTabs,b,n=>$('#'+n.dataset.editorTab+'-content'));if(b.dataset.editorTab==='properties')renderInspector();}eTabs.forEach(b=>b.addEventListener('click',()=>eTab(b)));tabKeys(eTabs,eTab);
  function openEditor(){if(!editor.open){editor.showModal();document.body.style.overflow='hidden';requestAnimationFrame(()=>{fit();if(viewport.clientWidth<600)setZoom(.45);refresh();});}}
  editor.addEventListener('close',()=>{document.body.style.overflow='';clearTimeout(saveTimer);try{localStorage.setItem(STORAGE,snapshot());}catch{}});
  $$('[data-open-playground]').forEach(b=>b.addEventListener('click',openEditor));$('#close-editor').addEventListener('click',()=>editor.close());
  function addNode(type,custom={},at){
    if(state.nodes.length>=150){toast('This slate has 150 items. Remove an item to add another.');return;}
    checkpoint();const count=state.nodes.length%7,base={id:uid(),type,x:at?at[0]:170+count*25,y:at?at[1]:200+count*35};let n;
    if(type==='button')n={...base,w:250,label:'Button',variant:'primary',size:'large',state:'default',leading:true,trailing:true,...custom};
    if(type==='input')n={...base,w:300,label:'Your label',placeholder:'Enter a value',helper:'Helper text',value:'Enter a value',enteredValue:'',valueType:'placeholder',state:'default',showLabel:true,showHelper:true,leading:true,trailing:true,helperIcon:true,hasValue:true,...custom};
    if(type==='text')n={...base,w:500,text:'Write something here.',font:'body',fontSize:16,colour:kp('colorAchromaticBlack'),...custom};
    n.id=base.id;n.x=clamp(n.x,0,1200-n.w);n.y=clamp(n.y,0,700);state.nodes.push(n);selected=n.id;tool='select';setMode('arrange');setTool('select');eTab($('#properties-tab'));persist();$('.canvas-item[data-id="'+selected+'"]')?.scrollIntoView({block:'nearest',inline:'nearest'});
  }
  $$('[data-add]').forEach(b=>{b.addEventListener('click',()=>addNode(b.dataset.add));b.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',b.dataset.add);e.dataTransfer.effectAllowed='copy';});});
  stage.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='copy';});stage.addEventListener('drop',e=>{e.preventDefault();const type=e.dataTransfer.getData('text/plain');if(['button','input'].includes(type))addNode(type,{},point(e));});
  $('#button-to-canvas').addEventListener('click',()=>{openEditor();const n=demoButton();delete n.id;addNode('button',n,[175,200]);});
  $('#input-to-canvas').addEventListener('click',()=>{openEditor();const n=demoInput();delete n.id;addNode('input',n,[175,300]);});
  $$('button[data-tool]').forEach(b=>b.addEventListener('click',()=>setTool(b.dataset.tool)));$$('button[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
  $('#undo').addEventListener('click',undo);$('#redo').addEventListener('click',redo);$('#zoom-in').addEventListener('click',()=>setZoom(zoom+.1));$('#zoom-out').addEventListener('click',()=>setZoom(zoom-.1));$('#zoom-fit').addEventListener('click',fit);
  stage.addEventListener('pointerdown',e=>{
    if(mode!=='arrange'||e.button!==0)return;const at=point(e);
    if(tool==='text'){e.preventDefault();addNode('text',{},at);return;}
    if(tool==='draw'){e.preventDefault();if(state.strokes.length>=300){toast('This slate has 300 strokes. Clear a drawing or start a new canvas.');return;}checkpoint();drawing={colour:drawToken,width:drawWidth,points:[[Math.round(at[0]),Math.round(at[1])]]};state.strokes.push(drawing);stage.setPointerCapture(e.pointerId);renderStrokes();return;}
    const item=e.target.closest('.canvas-item');
    if(item){e.preventDefault();selected=item.dataset.id;const n=state.nodes.find(n=>n.id===selected);drag={id:selected,start:at,x:n.x,y:n.y,saved:snapshot(),moved:false};$$('.canvas-item').forEach(i=>i.dataset.selected=String(i.dataset.id===selected));eTab($('#properties-tab'));renderInspector();item.focus({preventScroll:true});stage.setPointerCapture(e.pointerId);}
    else{selected=null;renderCanvas();renderInspector();stage.focus({preventScroll:true});}
  });
  stage.addEventListener('pointermove',e=>{
    const at=point(e);
    if(drawing){const last=drawing.points.at(-1);if(Math.hypot(at[0]-last[0],at[1]-last[1])>1.5&&drawing.points.length<5000){drawing.points.push([Math.round(at[0]),Math.round(at[1])]);renderStrokes();}}
    if(drag){const n=state.nodes.find(n=>n.id===drag.id),dx=at[0]-drag.start[0],dy=at[1]-drag.start[1];if(Math.abs(dx)+Math.abs(dy)>1)drag.moved=true;n.x=Math.round(clamp(drag.x+dx,0,1200-n.w));n.y=Math.round(clamp(drag.y+dy,0,750));const el=$('.canvas-item[data-id="'+n.id+'"]');el.style.left=n.x+'px';el.style.top=n.y+'px';}
  });
  function finishPointer(){if(drawing){drawing=null;renderCanvas();persist();}if(drag){if(drag.moved){checkpoint(drag.saved);persist();renderInspector();}drag=null;}}
  stage.addEventListener('pointerup',finishPointer);stage.addEventListener('pointercancel',finishPointer);
  function selectHTML(label,prop,value,options){return '<label>'+esc(label)+'<select data-prop="'+prop+'">'+options.map(o=>{const v=Array.isArray(o)?o[0]:o,text=Array.isArray(o)?o[1]:cap(o);return '<option value="'+esc(v)+'"'+(String(value)===String(v)?' selected':'')+'>'+esc(text)+'</option>';}).join('')+'</select></label>';}
  function inputHTML(label,prop,value,type='text'){return '<label>'+esc(label)+'<input data-prop="'+prop+'" type="'+type+'" value="'+esc(value)+'"'+(type==='text'?' maxlength="140"':' min="0" max="1200"')+'></label>';}
  function checkHTML(label,prop,value){return '<label class="check-label">'+esc(label)+'<input type="checkbox" data-prop="'+prop+'"'+(value?' checked':'')+'></label>';}
  const colourOptions=()=>tokens.filter(t=>t.collection==='primitives').map(t=>[t.key,pretty(t.name)]);
  function renderInspector(){
    const box=$('#properties-content'),n=state.nodes.find(n=>n.id===selected);
    if(tool==='draw'&&mode==='arrange'){
      box.innerHTML='<div class="drawing-inspector"><p class="property-title">Draw</p>'+selectHTML('Ink colour','drawToken',drawToken,colourOptions())+selectHTML('Stroke width','drawWidth',drawWidth,[[2,'Fine · 2px'],[3,'Medium · 3px'],[5,'Bold · 5px']])+'<p class="control-note">Undo removes the last stroke.</p><button id="clear-drawings" class="utility-button">Clear drawings</button></div>';$('#clear-drawings').addEventListener('click',()=>{if(!state.strokes.length)return;checkpoint();state.strokes=[];renderCanvas();persist();});
    }else if(!n){box.innerHTML='<div class="empty-inspector"><p>'+(mode==='preview'?'Try the components. Choose Arrange to edit again.':'Select an item to edit its properties.')+'</p></div>';}
    else{
      let h='<p class="property-title">'+(n.type==='text'?'Text':cap(n.type))+'</p><small class="component-spec property-spec">'+esc(componentSpecs(n))+'</small>';
      if(n.type==='button'){h+=selectHTML('Type','variant',n.variant,['primary','secondary','tertiary'])+selectHTML('State','state',n.state,buttonStates)+selectHTML('Size','size',n.size,['large','small'])+checkHTML('Show Right Icon','trailing',n.trailing)+checkHTML('Show Left Icon','leading',n.leading)+checkHTML('Show Text','showText',n.showText!==false)+inputHTML('Text','label',n.label);}
      if(n.type==='input'){h+=selectHTML('State','state',n.state,inputStates)+selectHTML('Value Type','valueType',n.valueType||'default',['default','placeholder'])+checkHTML('Has Label','showLabel',n.showLabel)+inputHTML('Label','label',n.label)+checkHTML('Helper Text','showHelper',n.showHelper!==false)+inputHTML('Helper Text','helper',n.helper)+checkHTML('Has Left Icon','leading',n.leading!==false)+checkHTML('Has Right Icon','trailing',n.trailing!==false)+checkHTML('Has Icon with Helper Text','helperIcon',n.helperIcon!==false)+checkHTML('Has Value','hasValue',n.hasValue!==false)+inputHTML('Value','value',n.value);}
      if(n.type==='text'){h+='<label>Text<textarea data-prop="text" rows="3" maxlength="1000">'+esc(n.text)+'</textarea></label>';h+=selectHTML('Typeface','font',n.font,[['heading','Heading typeface · Bold'],['body','Text typeface · Regular'],['title','Text typeface · Medium']])+selectHTML('Size','fontSize',n.fontSize,sizes.map(s=>[s,s+'px']))+selectHTML('Colour','colour',n.colour,colourOptions());}
      h+='<details class="advanced-properties"><summary>Width</summary>'+inputHTML('Width in pixels','w',n.w,'number')+'</details><div class="property-actions"><button id="duplicate-item" class="utility-button">Duplicate</button><button id="delete-item" class="utility-button">Delete</button></div>';box.innerHTML=h;
      $('#duplicate-item').addEventListener('click',()=>{if(state.nodes.length>=150){toast('This slate has 150 items.');return;}checkpoint();const copy={...n,id:uid(),x:clamp(n.x+25,0,1200-n.w),y:clamp(n.y+35,0,700)};state.nodes.push(copy);selected=copy.id;refresh();persist();});$('#delete-item').addEventListener('click',removeSelected);
    }
    $$('[data-prop]',box).forEach(el=>el.addEventListener(el.tagName==='SELECT'||el.type==='checkbox'||el.type==='number'?'change':'input',()=>{
      const prop=el.dataset.prop;if(prop==='drawToken'){drawToken=el.value;return;}if(prop==='drawWidth'){drawWidth=Number(el.value);return;}const n=state.nodes.find(n=>n.id===selected);if(!n)return;checkpoint();let value=el.type==='checkbox'?el.checked:el.value;if(prop==='x')value=clamp(value,0,1200-n.w);if(prop==='y')value=clamp(value,0,750);if(prop==='w')value=clamp(value,100,1200-n.x);if(prop==='fontSize')value=Number(value);n[prop]=value;if(n.type==='input'&&['valueType','value'].includes(prop))n.enteredValue='';renderCanvas();const spec=$('.property-spec',box);if(spec)spec.textContent=componentSpecs(n);persist();
    }));
  }
  function removeSelected(){if(!selected)return;checkpoint();state.nodes=state.nodes.filter(n=>n.id!==selected);selected=null;refresh();persist();}
  editor.addEventListener('keydown',e=>{
    const editable=e.target.closest('input,select,textarea,[contenteditable=true]');
    if(!editable&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();return;}
    if(!editable&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo();return;}if(editable||mode!=='arrange')return;
    if((e.key==='Delete'||e.key==='Backspace')&&selected){e.preventDefault();removeSelected();}
    const n=state.nodes.find(n=>n.id===selected);
    if(n&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)&&e.target.closest('#canvas')){e.preventDefault();checkpoint();const d=e.shiftKey?10:1;n.x=clamp(n.x+(e.key==='ArrowRight'?d:e.key==='ArrowLeft'?-d:0),0,1200-n.w);n.y=clamp(n.y+(e.key==='ArrowDown'?d:e.key==='ArrowUp'?-d:0),0,750);renderCanvas();renderInspector();$('.canvas-item[data-id="'+selected+'"]')?.focus({preventScroll:true});persist();}
  });
  function renderVariableOptions(filter=''){
    const select=$('#variable-select');select.replaceChildren();const list=tokens.filter(t=>(t.name+' '+pretty(t.name)).toLowerCase().includes(filter.toLowerCase()));list.sort((a,b)=>(a.collection==='colorSymanticTokens'?-1:1)-(b.collection==='colorSymanticTokens'?-1:1));
    list.forEach(t=>{const o=document.createElement('option');o.value=t.key;o.textContent=pretty(t.name);select.append(o);});if(list.some(t=>t.key===variableKey))select.value=variableKey;else if(list.length)variableKey=list[0].key;select.disabled=!list.length;renderVariableControl();
  }
  function renderVariableControl(){const v=get(variableKey);$('#variable-hex').value=v.toUpperCase();$('#variable-colour').value=v.slice(0,7);$('#variable-meta').textContent='Original: '+(original[variableKey]||'').toUpperCase()+(state.overrides[variableKey]?' · Edited':'')+(v.length===9?' · Includes alpha':'');$('#reset-variable').disabled=!state.overrides[variableKey];}
  function changeVariable(value){if(!HEX.test(value)){toast('Use a hex colour such as #C5FF64 or #FFFFFF00.');renderVariableControl();return;}if(get(variableKey).toLowerCase()===value.toLowerCase())return;checkpoint();state.overrides[variableKey]=value.toLowerCase();renderCanvas();renderVariableControl();persist();}
  $('#variable-search').addEventListener('input',e=>renderVariableOptions(e.target.value));$('#variable-select').addEventListener('change',e=>{variableKey=e.target.value;renderVariableControl();});$('#variable-colour').addEventListener('change',e=>{const v=get(variableKey);changeVariable(e.target.value+(v.length===9?v.slice(7):''));});$('#variable-hex').addEventListener('input',e=>{const value=e.target.value.trim();if(HEX.test(value))changeVariable(value);});$('#variable-hex').addEventListener('change',e=>changeVariable(e.target.value.trim()));$('#reset-variable').addEventListener('click',()=>{checkpoint();delete state.overrides[variableKey];renderCanvas();renderVariableControl();persist();});
  $$('[data-quick-token]').forEach(b=>b.addEventListener('click',()=>{variableKey=ks(b.dataset.quickToken);$('#variable-search').value='';renderVariableOptions();}));
  $('#reset-canvas').addEventListener('click',()=>{checkpoint();state.nodes=[];state.strokes=[];selected=null;setMode('arrange');setTool('select');refresh();persist();toast('Slate cleared. Undo restores it.');});
  $('#load-example').addEventListener('click',()=>{checkpoint();state=starter();selected=null;setMode('arrange');setTool('select');refresh();persist();fit();toast('Example restored.');});
  function validate(data){
    if(!data||data.version!==1||!Array.isArray(data.nodes)||!Array.isArray(data.strokes)||data.nodes.length>150||data.strokes.length>300)throw Error('Invalid saved slate.');
    const out={version:1,nodes:[],strokes:[],overrides:{}},ids=new Set();
    for(const n of data.nodes){
      if(!n||!['text','button','input'].includes(n.type))throw Error('Unsupported saved component.');const id=typeof n.id==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(n.id)&&!ids.has(n.id)?n.id:uid();ids.add(id);
      const v={id,type:n.type,w:clamp(n.w,100,1150),x:0,y:clamp(n.y,0,750)};v.x=clamp(n.x,0,1200-v.w);
      if(n.type==='button')Object.assign(v,{label:String(n.label||'Button').slice(0,140),variant:['primary','secondary','tertiary'].includes(n.variant)?n.variant:'primary',size:n.size==='small'?'small':'large',state:buttonStates.includes(n.state)?n.state:'default',leading:!!n.leading,trailing:!!n.trailing,showText:n.showText!==false});
      if(n.type==='input')Object.assign(v,{label:String(n.label||'Input field').slice(0,140),placeholder:String(n.placeholder||'').slice(0,140),helper:String(n.helper||'').slice(0,140),value:String(n.value||'').slice(0,140),state:inputStates.includes(n.state)?n.state:'default',showLabel:!!n.showLabel,valueType:n.valueType==='placeholder'?'placeholder':'default',enteredValue:String(n.enteredValue||'').slice(0,140),showHelper:n.showHelper!==false,leading:n.leading!==false,trailing:n.trailing!==false,helperIcon:n.helperIcon!==false,hasValue:n.hasValue!==false});
      if(n.type==='text')Object.assign(v,{text:String(n.text||'').slice(0,1000),font:['heading','body','title'].includes(n.font)?n.font:'body',fontSize:sizes.includes(Number(n.fontSize))?Number(n.fontSize):24,colour:original[n.colour]&&n.colour.startsWith('primitives.')?n.colour:kp('colorAchromaticBlack')});out.nodes.push(v);
    }
    for(const s of data.strokes){if(!s||!Array.isArray(s.points)||s.points.length>5000)throw Error('Invalid saved drawing.');const points=s.points.map(p=>{if(!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite))throw Error('Invalid drawing points.');return [clamp(p[0],0,1200),clamp(p[1],0,800)];});if(points.length)out.strokes.push({points,width:clamp(s.width,1,12),colour:original[s.colour]&&s.colour.startsWith('primitives.')?s.colour:kp('colorPrimaryPrimary500')});}
    Object.entries(data.overrides||{}).forEach(([key,value])=>{if(Object.hasOwn(original,key)&&typeof value==='string'&&HEX.test(value))out.overrides[key]=value;});return out;
  }
  function toast(message){const t=editor.open?$('#editor-toast'):$('#page-toast');t.textContent=message;t.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('visible'),3500);}
  try{const stored=localStorage.getItem(STORAGE);if(stored)state=validate(JSON.parse(stored));}catch{}
  renderPalette();selectColour(selectedColour);renderButtonDemo();renderInputDemo();renderVariableOptions();renderCtas();updateType();updateHeroSpecs();refresh();setZoom(zoom);$('#back-to-top').addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{updateHeroSpecs();if(editor.open)fit();},150);});
})();
