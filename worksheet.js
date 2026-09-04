
document.querySelectorAll('.mcq').forEach(box=>{
  const check=box.querySelector('.check');
  if(check)check.onclick=()=>{
    const chosen=box.querySelector('input:checked');
    const msg=box.querySelector('.feedback');
    if(!chosen){msg.textContent='Choose an answer first.';return}
    const ok=chosen.value===box.dataset.answer;
    msg.textContent=ok?'Correct.':'Not yet. Revisit the simulation evidence and try again.';
    msg.style.color=ok?'#167b46':'#a54a42';
  };
});
