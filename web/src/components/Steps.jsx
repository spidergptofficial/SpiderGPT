export default function Steps({step}){return <div className="steps" aria-label={`Step ${step} of 2`}><i className="on"/><i className={step>1?'on':''}/></div>;}
