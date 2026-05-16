import { sendMessageToCoach } from './openaiClient';
import { useState, useRef, useEffect } from "react";
import { supabase } from './supabaseClient';


export default function App() {
  // Auth state
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // App state
  const [tab, setTab] = useState("home");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 769);
  
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 769);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [viewPost, setViewPost] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);
  const [currentAgent, setCurrentAgent] = useState("general");
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [chatOpen, setChatOpen] = useState(null);
  const [recording, setRecording] = useState(false);
  const aiEnd = useRef(null);
  const [showHealthDisclaimer, setShowHealthDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const [likes, setLikes] = useState({});
  const [follows, setFollows] = useState({});
  const [newPost, setNewPost] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);

  // Real data from Supabase
  const [realUsers, setRealUsers] = useState([]);
  const [realPosts, setRealPosts] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Check auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchCurrentUser(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchCurrentUser(session.user.id);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch current user profile
  const fetchCurrentUser = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) {
      setCurrentUser(data);
    }
  };

  // Fetch real users and posts
  useEffect(() => {
    if (session) {
      fetchRealUsers();
      fetchRealPosts();
    }
  }, [session]);

  const fetchRealUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setRealUsers(data);
    }
  };

  const fetchRealPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (*)
      `)
      .order('created_at', { ascending: false });
    
    if (data) {
      setRealPosts(data);
    }
  };

  // Upload photo
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !currentUser) return;

    setUploadingPhoto(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      alert('Error subiendo foto');
      setUploadingPhoto(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', currentUser.id);

    if (!updateError) {
      setCurrentUser({ ...currentUser, avatar_url: publicUrl });
    }

    setUploadingPhoto(false);
  };

  // Create post
  const createPost = async () => {
    if (!newPost.trim() || !currentUser) return;

    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          user_id: currentUser.id,
          content: newPost,
        }
      ])
      .select(`
        *,
        profiles (*)
      `);

    if (!error && data) {
      setRealPosts([data[0], ...realPosts]);
      setNewPost("");
      setShowNewPost(false);
    }
  };

  // AI Coach with OpenAI
  const sendAI = async (text) => {
    if (!text.trim()) return;
    
    if (!disclaimerAccepted) {
      setShowHealthDisclaimer(true);
      setAiInput(text);
      return;
    }
    
    const now = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    setAiMessages(m => [...m, { id:Date.now(), from:"me", type:"text", text, time:now }]);
    setAiInput("");
    setThinking(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Eres un ${SPECIALISTS.find(s => s.id === currentAgent)?.role || 'asistente'} para jóvenes futbolistas. Responde de forma amigable, concisa y motivadora en español.`
            },
            { role: 'user', content: text }
          ],
          max_tokens: 300,
        })
      });

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      setAiMessages(m => [...m, {
        id: Date.now() + 1,
        from: "ai",
        type: "text",
        text: aiResponse,
        time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
      }]);
    } catch (error) {
      setAiMessages(m => [...m, {
        id: Date.now() + 1,
        from: "ai",
        type: "text",
        text: "Lo siento, hubo un error. Intenta de nuevo.",
        time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
      }]);
    }

    setThinking(false);
  };

  // Specialists definition
  const SPECIALISTS = [
    {id:"general",name:"General",emoji:"⚽",role:"entrenador general de fútbol"},
    {id:"tecnica",name:"Técnica",emoji:"🎯",role:"especialista en técnica y fundamentos"},
    {id:"tactica",name:"Táctica",emoji:"🧠",role:"analista táctico"},
    {id:"fisica",name:"Física",emoji:"💪",role:"preparador físico"},
    {id:"psicologia",name:"Psicología",emoji:"🧘",role:"psicólogo deportivo"},
    {id:"nutricion",name:"Nutrición",emoji:"🥗",role:"nutricionista deportivo"},
  ];

  const agent = SPECIALISTS.find(s => s.id === currentAgent);

  useEffect(() => {
    if (tab === "coach") aiEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, thinking, tab]);

  // Demo users (keeping the 20 demo users)
  const DEMO_USERS = [
    {id:"u1",name:"Santiago Medina",pos:"DEF",age:17,country:"🇨🇴 Colombia",city:"Medellín",verified:true,av:"SM",bio:"Sueño con jugar en Europa 🌍"},
    {id:"u2",name:"Lucía Fernández",pos:"MED",age:16,country:"🇦🇷 Argentina",city:"Buenos Aires",verified:false,av:"LF",bio:"Pasión por el fútbol ⚽"},
    {id:"u3",name:"Mamadou Diallo",pos:"DEL",age:18,country:"🇸🇳 Senegal",city:"Dakar",verified:true,av:"MD",bio:"Velocidad y goles 🔥"},
    {id:"u4",name:"Kofi Mensah",pos:"POR",age:17,country:"🇬🇭 Ghana",city:"Accra",verified:false,av:"KM",bio:"Guardameta profesional 🧤"},
    {id:"u5",name:"Carlos Ruiz",pos:"DEL",age:16,country:"🇲🇽 México",city:"Guadalajara",verified:true,av:"CR",bio:"Goleador nato ⚡"},
    {id:"u6",name:"Valentina Silva",pos:"MED",age:17,country:"🇺🇾 Uruguay",city:"Montevideo",verified:false,av:"VS",bio:"Juego limpio 🎯"},
    {id:"u7",name:"André Costa",pos:"DEF",age:18,country:"🇧🇷 Brasil",city:"São Paulo",verified:true,av:"AC",bio:"Defensa sólida 🛡️"},
    {id:"u8",name:"Sofía Martínez",pos:"DEL",age:16,country:"🇨🇱 Chile",city:"Santiago",verified:false,av:"SM2",bio:"Rapidez en ataque 💨"},
    {id:"u9",name:"Diego Paredes",pos:"MED",age:17,country:"🇵🇪 Perú",city:"Lima",verified:true,av:"DP",bio:"Visión de juego 👁️"},
    {id:"u10",name:"Amara Koné",pos:"DEF",age:16,country:"🇲🇱 Mali",city:"Bamako",verified:false,av:"AK",bio:"Fuerza y técnica 💪"},
    {id:"u11",name:"Tomás Benítez",pos:"POR",age:18,country:"🇵🇾 Paraguay",city:"Asunción",verified:true,av:"TB",bio:"Reflejos de acero 🔥"},
    {id:"u12",name:"Isabella Rojas",pos:"MED",age:17,country:"🇨🇴 Colombia",city:"Cali",verified:false,av:"IR",bio:"Control total ⚽"},
    {id:"u13",name:"Kwame Owusu",pos:"DEL",age:16,country:"🇬🇭 Ghana",city:"Kumasi",verified:true,av:"KO",bio:"Potencia ofensiva ⚡"},
    {id:"u14",name:"Nia Okafor",pos:"DEF",age:17,country:"🇬🇭 Ghana",city:"Accra",verified:false,av:"NO",bio:"Marcaje perfecto 🎯"},
    {id:"u15",name:"Mateo Vega",pos:"MED",age:18,country:"🇲🇽 México",city:"Ciudad de México",verified:true,av:"MV",bio:"Precisión en pases 🔄"},
    {id:"u16",name:"Cheikh Ba",pos:"DEL",age:16,country:"🇸🇳 Senegal",city:"Saint-Louis",verified:false,av:"CB",bio:"Finalizador letal 🎯"},
    {id:"u17",name:"Fatou Sow",pos:"MED",age:17,country:"🇸🇳 Senegal",city:"Thiès",verified:true,av:"FS",bio:"Creatividad pura ✨"},
    {id:"u18",name:"Martina López",pos:"DEF",age:16,country:"🇺🇾 Uruguay",city:"Punta del Este",verified:false,av:"ML",bio:"Liderazgo en defensa 👊"},
    {id:"u19",name:"Abena Mensah",pos:"POR",age:18,country:"🇬🇭 Ghana",city:"Tema",verified:true,av:"AM",bio:"Última línea 🧱"},
    {id:"u20",name:"Ricardo Santos",pos:"DEL",age:17,country:"🇧🇷 Brasil",city:"Rio de Janeiro",verified:false,av:"RS",bio:"Estilo brasileño 🇧🇷"},
  ];

  const DEMO_POSTS = [
    {id:"p1",userId:"u1",text:"Hat-trick hoy en el campeonato municipal ⚽⚽⚽ Gracias a Dios y a mi equipo 🙏",img:"partido",likes:87,comments:12,time:"2h"},
    {id:"p2",name:"Lucía Fernández",verified:false,time:"5h",text:"Entrenar bajo la lluvia ☔ no es excusa, es mentalidad 💪",img:"entrenamiento",likes:124,comments:18},
    {id:"p3",name:"Mamadou Diallo",verified:true,time:"1d",text:"Primer gol con la sub-19 🔥 Dedicado a mi familia en Senegal 🇸🇳❤️",img:"celebracion",likes:203,comments:34},
    {id:"p4",name:"Kofi Mensah",verified:false,time:"2d",text:"Clean sheet en semifinales 🧤 El trabajo duro paga",img:"atajada",likes:156,comments:21},
    {id:"p5",name:"Carlos Ruiz",verified:true,time:"3d",text:"Video: Golazo de chilena en entrenamiento 🎯",video:true,likes:312,comments:45},
    {id:"p6",name:"Valentina Silva",verified:false,time:"4d",text:"Recuperada de la lesión ✅ Lista para volver más fuerte 💪",img:"gym",likes:98,comments:27},
    {id:"p7",name:"André Costa",verified:true,time:"5d",text:"Scout del Barcelona me contactó 👀 No puedo creer que esto esté pasando",likes:421,comments:89},
    {id:"p8",name:"Sofía Martínez",verified:false,time:"6d",text:"Triplete en la liga femenina ⚡⚡⚡ Gracias al profe por creer en mí",img:"gol",likes:187,comments:31},
    {id:"p9",name:"Diego Paredes",verified:true,time:"1w",text:"Asistencia del año 🎨 El fútbol es arte",video:true,likes:267,comments:52},
    {id:"p10",name:"Amara Koné",verified:false,time:"1w",text:"Primer partido profesional a los 16 💫 Los sueños se cumplen",img:"debut",likes:234,comments:43},
    {id:"p11",name:"Tomás Benítez",verified:true,time:"1w",text:"Penalti atajado en el minuto 90 🔥 El equipo me lo agradeció",img:"pena",likes:298,comments:67},
    {id:"p12",name:"Isabella Rojas",verified:false,time:"2w",text:"Golazo de tiro libre hoy ⚽ Practicar 100 veces valió la pena",video:true,likes:176,comments:29},
    {id:"p13",name:"Kwame Owusu",verified:true,time:"2w",text:"Convocado a la selección sub-17 🇬🇭 Orgullo nacional",img:"seleccion",likes:445,comments:78},
    {id:"p14",name:"Nia Okafor",verified:false,time:"2w",text:"Mejor defensora del torneo 🏆 El trabajo en silencio habla",img:"premio",likes:201,comments:38},
    {id:"p15",name:"Mateo Vega",verified:true,time:"3w",text:"Pase gol al 89' para clasificar 🎯 Adrenalina pura",video:true,likes:334,comments:61},
  ];

  // Merge demo and real users/posts
  const allUsers = [...realUsers, ...DEMO_USERS];
  const allPosts = [...realPosts.map(p => ({
    id: p.id,
    userId: p.user_id,
    name: p.profiles?.full_name || p.profiles?.username,
    verified: p.profiles?.verified,
    text: p.content,
    img: p.image_url ? 'uploaded' : null,
    time: getTimeAgo(p.created_at),
    likes: p.likes_count || 0,
    comments: p.comments_count || 0,
    isReal: true,
  })), ...DEMO_POSTS.map(p => ({...p, isReal: false}))].sort((a, b) => {
    // Simple time-based sorting
    return 0; // Mix them together
  });

  function getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return `${Math.floor(diffDays / 7)}w`;
  }

  const CHATS = [
    {id:"c1",name:"Carlos Ruiz",av:"CR",lastMsg:"Vamos a entrenar mañana?",time:"10m",unread:2},
    {id:"c2",name:"Lucía Fernández",av:"LF",lastMsg:"Gracias por el consejo!",time:"1h",unread:0},
    {id:"c3",name:"Mamadou Diallo",av:"MD",lastMsg:"💪",time:"2h",unread:1},
  ];

  if (loading) {
    return <div style={{minHeight:'100vh',background:'#0a0e14',display:'flex',alignItems:'center',justifyContent:'center',color:'#ECEFF4'}}>Cargando...</div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <>
      <style>{`
*{margin:0;padding:0;box-sizing:border-box}
body,#root{font-family:'Outfit',sans-serif;background:#0a0e14;color:#ECEFF4;height:100vh;overflow:hidden}
.app{max-width:480px;margin:0 auto;height:100vh;display:flex;flex-direction:column;background:#0a0e14;position:relative;overflow:hidden}
@media (min-width: 769px) {
  .app{max-width:1400px}
  .hdr{padding:16px 40px}
  .logo-text{font-size:24px}
  
  .desktop-hero{background:linear-gradient(135deg,rgba(0,230,118,0.03),rgba(0,200,83,0.01));padding:80px 40px 60px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.04)}
  .hero-title{font-size:52px;font-weight:900;background:linear-gradient(135deg,#00E676,#69F0AE);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px;font-family:'Inter',sans-serif;line-height:1.1}
  .hero-subtitle{font-size:22px;color:#8899A6;margin-bottom:32px;max-width:600px;margin-left:auto;margin-right:auto;line-height:1.4}
  .hero-stats{display:flex;gap:40px;justify-content:center;margin-top:24px}
  .hero-stat{text-align:center}
  .hero-stat-value{font-size:36px;font-weight:900;color:#00E676;font-family:'Space Mono',monospace}
  .hero-stat-label{font-size:13px;color:#556677;margin-top:4px;text-transform:uppercase;letter-spacing:1px}
  .mc{padding:20px 40px}
  .posts-grid{display:grid;grid-template-columns:repeat(3, 1fr);gap:20px;max-width:1200px;margin:0 auto}
  .post{margin:0!important}
}

.hdr{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:1px solid rgba(255,255,255,0.06);background:rgba(10,14,20,0.95);backdrop-filter:blur(20px);flex-shrink:0;z-index:10}
.hb{background:none;border:none;color:#8899A6;cursor:pointer;font-size:20px;padding:4px 8px}
.logo{display:flex;align-items:center;gap:10px}
.logo-text{font-family:'Inter','SF Pro Display',-apple-system,system-ui,sans-serif;font-weight:900;font-size:20px;color:#FFFFFF;line-height:1;letter-spacing:-0.02em}
.logo-tag{font-size:8px;letter-spacing:2.5px;color:#00E676;font-weight:700;margin-top:2px;font-family:'Inter',sans-serif}
.notif{background:none;border:none;cursor:pointer;font-size:18px;position:relative;padding:6px}
.notif-badge{position:absolute;top:4px;right:4px;width:6px;height:6px;background:#FF5252;border-radius:50%}

.mc{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:70px}
@media (max-width: 768px) {
  .mc{padding-bottom:80px}
}
.mc::-webkit-scrollbar{width:3px}.mc::-webkit-scrollbar-thumb{background:#556677;border-radius:3px}

.post{background:#121820;border:1px solid rgba(255,255,255,0.06);border-radius:18px;padding:16px;margin-bottom:12px;cursor:pointer;transition:border-color 0.2s}
.post:hover{border-color:rgba(0,230,118,0.2)}
.post-hdr{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.pav{width:44px;height:44px;border-radius:12px;background:rgba(0,230,118,0.12);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#00E676;flex-shrink:0}
.pav img{width:100%;height:100%;object-fit:cover;border-radius:12px}
.pinfo{flex:1;min-width:0}
.pname{display:flex;align-items:center;gap:6px;font-weight:600;font-size:14px}
.pname svg{width:14px;height:14px;fill:#00E676}
.ptime{font-size:11px;color:#556677;margin-top:2px}
.post-text{font-size:14px;line-height:1.5;margin-bottom:12px;color:#ECEFF4}
.post-img{width:100%;aspect-ratio:16/10;background:linear-gradient(135deg,rgba(0,230,118,0.08),rgba(0,200,83,0.03));border-radius:14px;display:flex;align-items:center;justify-content:center;color:#556677;font-size:13px;margin-bottom:12px}
.post-actions{display:flex;gap:16px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.04)}
.pa{background:none;border:none;color:#8899A6;cursor:pointer;display:flex;align-items:center;gap:6px;font-size:13px;font-family:'Outfit';padding:4px 8px;border-radius:8px;transition:all 0.2s}
.pa:hover{background:rgba(255,255,255,0.03);color:#ECEFF4}
.pa.liked{color:#FF5252}

.chat-hdr{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid rgba(255,255,255,0.06);background:rgba(10,14,20,0.95);backdrop-filter:blur(20px);flex-shrink:0}
.chat-back{background:none;border:none;color:#8899A6;cursor:pointer;font-size:20px;padding:4px 8px}

.chat-item{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.04);cursor:pointer;transition:background 0.2s}
.chat-item:hover{background:rgba(255,255,255,0.02)}
.cav{width:48px;height:48px;border-radius:14px;background:rgba(0,230,118,0.12);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;color:#00E676;flex-shrink:0}
.cinfo{flex:1;min-width:0}
.cname{font-weight:600;font-size:14px;margin-bottom:3px}
.clast{font-size:13px;color:#8899A6;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cmeta{display:flex;flex-direction:column;align-items:flex-end;gap:4px}
.ctime{font-size:11px;color:#556677}
.cunread{background:#00E676;color:#0a0e14;font-size:10px;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 5px}

.chat-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
.cmsg{max-width:75%;padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.4;animation:fadeIn 0.2s}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.cmsg.me{background:linear-gradient(135deg,#00E676,#00C853);color:#0a0e14;align-self:flex-end;border-bottom-right-radius:4px}
.cmsg.them{background:#1e2732;align-self:flex-start;border-bottom-left-radius:4px}
.chat-input{padding:12px 16px;border-top:1px solid rgba(255,255,255,0.05);background:#0f1419;display:flex;gap:8px;align-items:center;flex-shrink:0}
.chat-field{flex:1;background:#1e2732;border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:8px 16px;color:#ECEFF4;font-family:'Outfit';font-size:13px;outline:none}
.chat-send{background:linear-gradient(135deg,#00E676,#00C853);border:none;width:36px;height:36px;border-radius:50%;color:#0a0e14;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}

.prof-card{background:linear-gradient(135deg,rgba(0,230,118,0.08),rgba(0,200,83,0.03));border-radius:20px;padding:24px;margin:16px;text-align:center}
.prof-av{width:80px;height:80px;border-radius:20px;background:rgba(0,230,118,0.12);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:28px;color:#00E676;margin:0 auto 12px;position:relative}
.prof-av img{width:100%;height:100%;object-fit:cover;border-radius:20px}
.upload-<label className="upload-btn" style={{zIndex: 99999, background: 'red', width: 60, height: 60}}>btn{position:absolute;bottom:-8px;right:-8px;width:32px;height:32px;background:#00E676;border-radius:50%;border:2px solid #0a0e14;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px}
.prof-name{font-size:20px;font-weight:700;margin-bottom:4px}
.prof-meta{font-size:13px;color:#8899A6;margin-bottom:16px}
.prof-bio{font-size:13px;color:#ECEFF4;margin-bottom:16px;line-height:1.5}
.prof-stats{display:flex;justify-content:center;gap:24px;margin-bottom:16px}
.pstat{text-align:center}
.pstat-val{font-size:18px;font-weight:700;color:#00E676}
.pstat-lbl{font-size:11px;color:#556677;margin-top:2px}
.prof-actions{display:flex;gap:8px;justify-content:center}
.prof-btn{flex:1;max-width:160px;padding:10px;border-radius:12px;border:none;font-weight:600;font-size:13px;cursor:pointer;font-family:'Outfit';transition:all 0.2s}
.prof-btn.pri{background:linear-gradient(135deg,#00E676,#00C853);color:#0a0e14}
.prof-btn.sec{background:rgba(255,255,255,0.06);color:#ECEFF4}
.prof-btn:hover{transform:translateY(-2px)}

.coach-screen{display:flex;flex-direction:column;height:100%}
.specialists{display:flex;gap:8px;padding:12px 16px;overflow-x:auto;border-bottom:1px solid rgba(255,255,255,0.04);flex-shrink:0}
.specialists::-webkit-scrollbar{display:none}
.spec{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:8px 16px;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px;font-size:13px;font-family:'Outfit';transition:all 0.2s;flex-shrink:0}
.spec:hover{background:rgba(255,255,255,0.06)}
.spec.active{background:linear-gradient(135deg,#00E676,#00C853);color:#0a0e14;border-color:#00E676}
.safety-banner{background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.2);border-radius:14px;padding:12px 16px;margin:12px 16px;display:flex;align-items:flex-start;gap:10px;font-size:12px;line-height:1.5}
.safety-banner span{font-size:16px;flex-shrink:0}
.ai-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
.ai-msg{max-width:85%;padding:12px 16px;border-radius:16px;font-size:13px;line-height:1.5;animation:fadeIn 0.3s}
.ai-msg.me{background:linear-gradient(135deg,#00E676,#00C853);color:#0a0e14;align-self:flex-end;border-bottom-right-radius:4px}
.ai-msg.ai{background:#1e2732;align-self:flex-start;border-bottom-left-radius:4px}
.ai-time{font-size:10px;opacity:0.6;margin-top:4px}
.ai-thinking{display:flex;gap:4px;padding:16px}
.ai-thinking span{width:8px;height:8px;background:#00E676;border-radius:50%;animation:bounce 1.4s infinite}
.ai-thinking span:nth-child(2){animation-delay:0.2s}
.ai-thinking span:nth-child(3){animation-delay:0.4s}
@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
.ai-input{padding:10px 14px 14px;border-top:1px solid rgba(255,255,255,0.05);background:#0f1419;display:flex;gap:7px;align-items:flex-end;flex-shrink:0}
.ai-rec{background:rgba(255,255,255,0.06);border:none;width:36px;height:36px;border-radius:50%;color:#ECEFF4;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.ai-field{flex:1;background:none;border:none;outline:none;color:#ECEFF4;font-family:'Outfit';font-size:13px;resize:none;max-height:70px;min-height:20px;line-height:1.5}
.ai-send{background:linear-gradient(135deg,#00E676,#00C853);border:none;width:36px;height:36px;border-radius:50%;color:#0a0e14;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;transition:transform 0.2s}
.ai-send:hover{transform:scale(1.05)}

/* HEALTH DISCLAIMER */
.disclaimer-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:10000;display:none;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(6px)}
.disclaimer-modal-bg.show{display:flex}

/* NEW POST MODAL */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9000;display:none;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)}
.modal-bg.show{display:flex}
.modal{background:#121820;border-radius:20px;width:90%;max-width:500px;margin:0 auto;padding:24px;border:1px solid rgba(255,255,255,0.08);box-shadow:0 20px 60px rgba(0,0,0,0.5);position:relative}
.modal-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.modal-title{font-weight:700;font-size:18px}
.modal-close{background:none;border:none;color:#8899A6;cursor:pointer;font-size:24px;padding:4px 8px}
.modal-textarea{width:100%;background:#0a0e14;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;color:#ECEFF4;font-family:'Outfit';font-size:14px;line-height:1.5;resize:vertical;min-height:120px;outline:none}
.modal-actions{display:flex;gap:8px;margin-top:12px}
.modal-btn{flex:1;padding:10px;border-radius:10px;border:none;font-weight:700;font-size:14px;cursor:pointer;font-family:'Outfit'}
.modal-btn.pri{background:#00E676;color:#0a0e14}
.modal-btn.sec{background:rgba(255,255,255,0.05);color:#ECEFF4}

.disclaimer-icon{font-size:48px;text-align:center;margin-bottom:16px}
.disclaimer-text{font-size:14px;line-height:1.6;color:#ECEFF4;margin-bottom:16px}
.disclaimer-list{list-style:none;padding-left:0;margin:12px 0}
.disclaimer-list li{padding:6px 0;padding-left:24px;position:relative;font-size:13px;color:#ECEFF4}
.disclaimer-list li::before{content:'•';position:absolute;left:8px;color:#00E676;font-weight:bold}
.disclaimer-emergency{background:rgba(255,82,82,0.1);border:1px solid rgba(255,82,82,0.3);border-radius:12px;padding:12px;margin:16px 0;font-size:13px;line-height:1.5}

/* NAV */
.bnav{display:flex!important;justify-content:space-around;align-items:center;padding:6px 0 calc(6px + env(safe-area-inset-bottom));border-top:1px solid rgba(255,255,255,0.06);background:rgba(10,14,20,0.97);backdrop-filter:blur(20px);flex-shrink:0;position:sticky;bottom:0;z-index:100;width:100%}
@media (max-width: 768px) {
  .bnav{display:flex!important;position:fixed;bottom:0;left:0;right:0}
}
.ni{display:flex;flex-direction:column;align-items:center;gap:1px;background:none;border:none;color:#556677;cursor:pointer;padding:5px 10px;font-size:9px;font-family:'Outfit';font-weight:500;position:relative}
.ni.on{color:#00E676}
.ni.on::before{content:'';position:absolute;top:-6px;width:20px;height:2px;background:#00E676;border-radius:0 0 2px 2px}
.ni-emoji{font-size:18px}
.nbg{position:absolute;top:0;right:0;background:#FF5252;color:white;font-size:8px;font-weight:700;min-width:14px;height:14px;border-radius:7px;display:flex;align-items:center;justify-content:center;padding:0 3px}

.fab{position:fixed;bottom:calc(70px + env(safe-area-inset-bottom));right:20px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#00E676,#00C853);box-shadow:0 8px 24px rgba(0,230,118,0.4);border:none;color:#0a0e14;font-size:26px;cursor:pointer;z-index:100;display:flex;align-items:center;justify-content:center;font-weight:300}
      `}</style>

      <div className="app">
        {/* HEADER */}
        {chatOpen ? (
          <div className="chat-hdr">
            <button className="chat-back" onClick={() => setChatOpen(null)}>←</button>
            <span style={{fontWeight:600,fontSize:14}}>{CHATS.find(c=>c.id===chatOpen)?.name}</span>
            <div style={{width:30}}/>
          </div>
        ) : viewProfile ? (
          <div className="hdr">
            <button className="hb" onClick={() => setViewProfile(null)}>←</button>
            <span style={{fontWeight:600}}>Perfil</span>
            <div style={{width:30}}/>
          </div>
        ) : viewPost ? (
          <div className="hdr">
            <button className="hb" onClick={() => setViewPost(null)}>←</button>
            <span style={{fontWeight:600}}>Post</span>
            <div style={{width:30}}/>
          </div>
        ) : (
          <div className="hdr">
            <div className="logo">
              <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="45" fill="#00E676" opacity="0.1"/>
                <circle cx="50" cy="50" r="20" fill="#00E676"/>
                <circle cx="50" cy="50" r="8" fill="#0a0e14"/>
              </svg>
              <div>
                <div className="logo-text">MiraFut</div>
                <div className="logo-tag">TALENTO SIN FRONTERAS</div>
              </div>
            </div>
            <button className="notif">
              🔔
              <span className="notif-badge"/>
            </button>
          </div>
        )}

        {/* DESKTOP HERO SECTION */}
        {isDesktop && tab === "home" && !viewPost && !viewProfile && (
          <div className="desktop-hero">
            <h1 className="hero-title">Talento sin fronteras</h1>
            <p className="hero-subtitle">
              La red social donde jóvenes futbolistas de todo el mundo comparten su pasión, 
              conectan con su comunidad y desarrollan su carrera con AI Coach 24/7
            </p>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">{allUsers.length}</div>
                <div className="hero-stat-label">Jugadores</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">{allPosts.length}</div>
                <div className="hero-stat-label">Posts activos</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">8</div>
                <div className="hero-stat-label">Países</div>
              </div>
            </div>
          </div>
        )}

        <div className="mc">
          {/* ====== HOME FEED ====== */}
          {tab === "home" && !viewPost && !viewProfile && (
            <div className="posts-grid">
              {allPosts.map(p => (
                <div key={p.id} className="post" onClick={() => setViewPost(p)}>
                  <div className="post-hdr">
                    <div className="pav">{p.name?.[0] || p.userId?.[0]}</div>
                    <div className="pinfo">
                      <div className="pname">
                        {p.name || 'Usuario'}
                        {p.verified && <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>}
                      </div>
                      <div className="ptime">{p.time}</div>
                    </div>
                  </div>
                  <div className="post-text">{p.text}</div>
                  {p.img && <div className="post-img">📷 {p.img === 'uploaded' ? 'Foto' : 'Foto del ' + p.img}</div>}
                  {p.video && <div className="post-img">🎥 Video</div>}
                  <div className="post-actions">
                    <button className={`pa ${likes[p.id]?'liked':''}`} onClick={(e)=>{e.stopPropagation();setLikes(l=>({...l,[p.id]:!l[p.id]}))}}>
                      ❤️ {p.likes + (likes[p.id]?1:0)}
                    </button>
                    <button className="pa">💬 {p.comments || 0}</button>
                    <button className="pa">🔗 Compartir</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ====== AI COACH ====== */}
          {tab === "coach" && (
            <div className="coach-screen">
              {currentAgent === "psicologia" && (
                <div className="safety-banner"><span>🔒</span><div><strong>Espacio seguro.</strong> Lo que hablemos es confidencial.</div></div>
              )}
              
              {currentAgent === "nutricion" && (
                <div className="safety-banner" style={{background:'rgba(255,183,77,0.08)',borderColor:'rgba(255,183,77,0.2)'}}><span>⚠️</span><div><strong>Consejo nutricional general.</strong> Para planes personalizados o condiciones médicas específicas, consulta un nutricionista certificado.</div></div>
              )}

              <div className="specialists">
                {SPECIALISTS.map(s => (
                  <button key={s.id} className={`spec ${currentAgent===s.id?'active':''}`} onClick={()=>setCurrentAgent(s.id)}>
                    <span>{s.emoji}</span><span>{s.name}</span>
                  </button>
                ))}
              </div>

              <div className="ai-msgs">
                {aiMessages.length === 0 && (
                  <div style={{textAlign:'center',padding:'40px 20px',color:'#556677'}}>
                    <div style={{fontSize:48,marginBottom:12}}>{agent.emoji}</div>
                    <div style={{fontSize:16,fontWeight:600,marginBottom:8,color:'#ECEFF4'}}>
                      {agent.name}
                    </div>
                    <div style={{fontSize:13,lineHeight:1.5}}>
                      Pregúntame lo que necesites sobre {agent.name.toLowerCase()}
                    </div>
                  </div>
                )}
                {aiMessages.map(m => (
                  <div key={m.id} className={`ai-msg ${m.from}`}>
                    <div>{m.text}</div>
                    <div className="ai-time">{m.time}</div>
                  </div>
                ))}
                {thinking && (
                  <div className="ai-thinking">
                    <span/><span/><span/>
                  </div>
                )}
                <div ref={aiEnd}/>
              </div>

              <div className="ai-input">
                <button className="ai-rec" onClick={()=>setRecording(!recording)}>{recording?'⏹️':'🎤'}</button>
                <textarea className="ai-field" placeholder={`Escríbele a ${agent.name}...`} value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendAI(aiInput);}}} rows={1}/>
                <button className="ai-send" onClick={()=>sendAI(aiInput)}>➤</button>
              </div>
            </div>
          )}

          {/* ====== CHAT ====== */}
          {tab === "chat" && !chatOpen && (
            <div>
              {CHATS.map(c => (
                <div key={c.id} className="chat-item" onClick={() => setChatOpen(c.id)}>
                  <div className="cav">{c.av}</div>
                  <div className="cinfo">
                    <div className="cname">{c.name}</div>
                    <div className="clast">{c.lastMsg}</div>
                  </div>
                  <div className="cmeta">
                    <div className="ctime">{c.time}</div>
                    {c.unread > 0 && <div className="cunread">{c.unread}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {chatOpen && (
            <>
              <div className="chat-msgs">
                <div className="cmsg them">Hola! Cómo estás?</div>
                <div className="cmsg me">Todo bien! Y vos?</div>
                <div className="cmsg them">Genial, querés entrenar mañana?</div>
              </div>
              <div className="chat-input">
                <input className="chat-field" placeholder="Escribe un mensaje..."/>
                <button className="chat-send">➤</button>
              </div>
            </>
          )}

          {/* ====== PROFILE ====== */}
          {tab === "profile" && currentUser && (
            <>
              <div className="prof-card">
                <div className="prof-av">
                  {currentUser.avatar_url ? (
                    <img src={currentUser.avatar_url} alt="Avatar" />
                  ) : (
                    currentUser.username?.[0]?.toUpperCase() || 'U'
                  )}
                  <label className="upload-btn">
                    📷
                    <input type="file" accept="image/*" style={{display:'none'}} onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                  </label>
                </div>
                <div className="prof-name">{currentUser.full_name || currentUser.username}</div>
                <div className="prof-meta">
                  {currentUser.position} • {currentUser.age || 17} años • {currentUser.country}
                </div>
                {currentUser.bio && <div className="prof-bio">{currentUser.bio}</div>}
                <div className="prof-stats">
                  <div className="pstat">
                    <div className="pstat-val">{realPosts.filter(p => p.user_id === currentUser.id).length}</div>
                    <div className="pstat-lbl">Posts</div>
                  </div>
                  <div className="pstat">
                    <div className="pstat-val">0</div>
                    <div className="pstat-lbl">Seguidores</div>
                  </div>
                  <div className="pstat">
                    <div className="pstat-val">0</div>
                    <div className="pstat-lbl">Siguiendo</div>
                  </div>
                </div>
                <div className="prof-actions">
                  <button className="prof-btn pri">Editar perfil</button>
                  <button className="prof-btn sec" onClick={async () => {
                    await supabase.auth.signOut();
                  }}>Cerrar sesión</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* FLOATING ACTION BUTTON */}
        {tab === "home" && !viewPost && !viewProfile && (
          <button className="fab" onClick={() => setShowNewPost(true)}>+</button>
        )}

        {/* HEALTH DISCLAIMER MODAL */}
        <div className={`disclaimer-modal-bg ${showHealthDisclaimer ? 'show' : ''}`} onClick={() => setShowHealthDisclaimer(false)}>
          {showHealthDisclaimer && (
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="disclaimer-icon">⚕️</div>
              <div className="modal-title" style={{textAlign:'center',marginBottom:'12px'}}>Aviso Importante sobre AI Coach</div>
              <div className="disclaimer-text">
                El AI Coach es una herramienta de <strong>orientación general</strong> diseñada para apoyar tu desarrollo deportivo.
              </div>
              <div className="disclaimer-text" style={{fontSize:'13px',color:'#FF9800'}}>
                <strong>NO reemplaza atención médica, psicológica o nutricional profesional.</strong>
              </div>
              <div className="disclaimer-text">
                Por favor consulta con un profesional de la salud si experimentas:
              </div>
              <ul className="disclaimer-list">
                <li>Problemas de salud física o mental</li>
                <li>Lesiones deportivas</li>
                <li>Síntomas que persisten</li>
                <li>Crisis emocional o pensamientos de hacerte daño</li>
              </ul>
              <div className="disclaimer-emergency">
                <strong>🚨 En caso de emergencia:</strong><br/>
                Contacta servicios de urgencia o líneas de ayuda en tu país inmediatamente.
              </div>
              <div className="modal-actions">
                <button className="modal-btn pri" onClick={() => {
                  setDisclaimerAccepted(true); 
                  setShowHealthDisclaimer(false);
                  if (aiInput.trim()) {
                    sendAI(aiInput);
                  }
                }}>
                  Entiendo y acepto
                </button>
              </div>
            </div>
          )}
        </div>

        {/* NEW POST MODAL */}
        <div className={`modal-bg ${showNewPost ? 'show' : ''}`} onClick={() => setShowNewPost(false)}>
          {showNewPost && (
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-hdr">
                <div className="modal-title">Nuevo Post</div>
                <button className="modal-close" onClick={() => setShowNewPost(false)}>×</button>
              </div>
              <textarea 
                className="modal-textarea" 
                placeholder="¿Qué está pasando?"
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
              />
              <div className="modal-actions">
                <button className="modal-btn sec" onClick={() => setShowNewPost(false)}>Cancelar</button>
                <button className="modal-btn pri" onClick={createPost}>Publicar</button>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM NAV */}
        <nav className="bnav">
          <button className={`ni ${tab==='home'?'on':''}`} onClick={()=>{setTab('home');setViewPost(null);setViewProfile(null);setChatOpen(null);}}><span className="ni-emoji">🏠</span><span>Inicio</span></button>
          <button className={`ni ${tab==='coach'?'on':''}`} onClick={()=>{setTab('coach');setChatOpen(null);}}><span className="ni-emoji">⚽</span><span>Coach</span></button>
          <button className={`ni ${tab==='chat'?'on':''}`} onClick={()=>{setTab('chat');setChatOpen(null);}}><span className="ni-emoji">💬</span><span>Chat</span>{CHATS.reduce((s,c)=>s+c.unread,0)>0 && <span className="nbg">{CHATS.reduce((s,c)=>s+c.unread,0)}</span>}</button>
          <button className={`ni ${tab==='profile'?'on':''}`} onClick={()=>{setTab('profile');setViewPost(null);setViewProfile(null);setChatOpen(null);}}><span className="ni-emoji">👤</span><span>Perfil</span></button>
        </nav>
      </div>
    </>
  );
}
export default App;
