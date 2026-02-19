export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen text-white bg-[#020202] overflow-hidden selection:bg-blue-500/30 flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/8 blur-[150px] rounded-full pointer-events-none animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-white/3 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] bg-blue-400/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 opacity-15 pointer-events-none" 
             style={{ 
               backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', 
               backgroundSize: '40px 40px'
             }} 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-950/10 pointer-events-none" />
      </div>
      
      <div className="relative z-10 w-full max-w-lg px-10 py-12">
        {children}
      </div>
    </div>
  );
}