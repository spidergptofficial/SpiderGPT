export class ApiError extends Error { constructor(status, code, message, details=null){ super(message); this.status=status; this.code=code; this.details=details; } }
export const errorHandler = (log) => (err, req, res, _next) => {
  if(err?.name==='ZodError') return res.status(400).json({error:{code:'invalid_request',message:'Check your input and try again.'}});
  if(err instanceof ApiError) return res.status(err.status).json({error:{code:err.code,message:err.message, ...(err.details?{details:err.details}:{})}});
  log.error({err:err?.message,path:req.path,method:req.method},'unhandled');
  res.status(500).json({error:{code:'internal',message:'Looks like something got tangled in the web. Try again.'}});
};
