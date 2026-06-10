import { supabase } from './supabaseClient';
import Auth from './Auth';
import { sendMessageToCoach } from './openaiClient';
import { useState, useRef, useEffect } from "react";

// ============ SIMULATED DATA ============
const CURRENT_USER = { id: 0, name: "Tú", avatar: "TU", bio: "Futbolista apasionado", followers: 45, following: 67, verified: false };

const USERS = [
  { id:1, name:"Santiago Medina", age:16, country:"Colombia", city:"Tumaco", position:"DEL", avatar:"SM", verified:true, followers:342, following:89, bio:"Delantero rápido. Sueño con Europa." },
  { id:2, name:"Lucía Fernández", age:17, country:"Argentina", city:"Rosario", position:"DEL", avatar:"LF", verified:true, followers:891, following:120, bio:"Goleadora de Rosario. Rumbo al profesionalismo." },
  { id:3, name:"Amara Diallo", age:15, country:"Senegal", city:"Thiès", position:"MED", avatar:"AD", verified:false, followers:156, following:45, bio:"Mediocampista creativo." },
  { id:4, name:"Diego Paredes", age:17, country:"Ecuador", city:"Esmeraldas", position:"MED", avatar:"DP", verified:true, followers:534, following:102, bio:"El fútbol me salvó." },
  { id:5, name:"Fatou Mbaye", age:15, country:"Senegal", city:"Dakar", position:"DEL", avatar:"FM", verified:false, followers:177, following:56, bio:"Empecé descalza en la playa." },
  { id:6, name:"Carlos Ruiz", age:16, country:"México", city:"Oaxaca", position:"POR", avatar:"CR", verified:true, followers:423, following:112, bio:"Portero con reflejos de gato." },
  { id:7, name:"Aisha Kamara", age:17, country:"Ghana", city:"Accra", position:"DEF", avatar:"AK", verified:false, followers:289, following:67, bio:"Defensa central fuerte." },
  { id:8, name:"Mateo Silva", age:15, country:"Uruguay", city:"Montevideo", position:"MED", avatar:"MS", verified:true, followers:567, following:134, bio:"Juego simple, efectivo." },
  { id:9, name:"Kwame Asante", age:16, country:"Ghana", city:"Kumasi", position:"DEF", avatar:"KA", verified:false, followers:210, following:67, bio:"Defensa rápido con salida limpia." },
  { id:10, name:"Isabella Torres", age:16, country:"Colombia", city:"Medellín", position:"DEL", avatar:"IT", verified:true, followers:701, following:98, bio:"Velocidad y definición. Antioquia!" },
  { id:11, name:"Thierno Ba", age:17, country:"Senegal", city:"Saint-Louis", position:"MED", avatar:"TB", verified:false, followers:198, following:54, bio:"Mediocampista elegante." },
  { id:12, name:"Valentina López", age:15, country:"Chile", city:"Valparaíso", position:"DEF", avatar:"VL", verified:false, followers:312, following:78, bio:"Defensa aguerrida. No paso ni una." },
  { id:13, name:"André Costa", age:17, country:"Brasil", city:"Salvador", position:"DEL", avatar:"AC", verified:true, followers:834, following:156, bio:"Ginga brasileña. El fútbol es arte." },
  { id:14, name:"Zara Ndiaye", age:16, country:"Senegal", city:"Ziguinchor", position:"MED", avatar:"ZN", verified:false, followers:267, following:61, bio:"Juego con corazón y técnica." },
  { id:15, name:"Emiliano Vargas", age:16, country:"Perú", city:"Callao", position:"DEL", avatar:"EV", verified:true, followers:445, following:89, bio:"Delantero del puerto chalaco." },
  { id:16, name:"Kofi Mensah", age:15, country:"Ghana", city:"Tema", position:"MED", avatar:"KM", verified:false, followers:178, following:43, bio:"Mediocampista box-to-box." },
  { id:17, name:"Camila Reyes", age:17, country:"México", city:"Guadalajara", position:"POR", avatar:"CRe", verified:true, followers:389, following:92, bio:"Primera portera de mi barrio." },
  { id:18, name:"Moussa Keita", age:16, country:"Mali", city:"Bamako", position:"DEF", avatar:"MK", verified:false, followers:234, following:58, bio:"Defensa central. Torre de Bamako." },
  { id:19, name:"Sofía Morales", age:15, country:"Paraguay", city:"Asunción", position:"MED", avatar:"SMo", verified:false, followers:298, following:71, bio:"Mediocampista creativa." },
  { id:20, name:"Emmanuel Osei", age:17, country:"Ghana", city:"Cape Coast", position:"DEL", avatar:"EO", verified:true, followers:512, following:103, bio:"Delantero letal. Heredé el gol." },
];

const POSTS = [
  { id:1, userId:1, name:"Santiago Medina", av:"SM", verified:true, time:"2h", text:"Hat-trick hoy en el campeonato municipal ⚽⚽⚽ Gracias a Dios y a mi equipo 🙏", image:"game", likes:87, comments:12, liked:false, commentList:[{u:"Lucía Fernández",t:"Crack! 🔥"},{u:"Diego Paredes",t:"Vamos hermano!"}] },
  { id:2, userId:2, name:"Lucía Fernández", av:"LF", verified:true, time:"5h", text:"Entrenar bajo la lluvia ☔ no es excusa, es mentalidad 💪", image:"training", likes:234, comments:31, liked:true, commentList:[{u:"Santiago Medina",t:"Así se hace!"},{u:"Amara Diallo",t:"Inspiradora 👏"}] },
  { id:3, userId:5, name:"Fatou Mbaye", av:"FM", verified:false, time:"1d", text:"Primer gol con la selección sub-16 de Senegal 🇸🇳⚽ Un sueño hecho realidad", image:"goal", likes:445, comments:67, liked:false, commentList:[{u:"Diego Paredes",t:"Felicidades! 🎉"},{u:"Lucía Fernández",t:"Qué orgullo 💚"}] },
  { id:4, userId:4, name:"Diego Paredes", av:"DP", verified:true, time:"2d", text:"Alguien más entrenando solo en casa? Compartan sus rutinas 👇", image:null, likes:123, comments:45, liked:false, commentList:[{u:"Santiago Medina",t:"Yo hago 100 toques diarios"},{u:"Amara Diallo",t:"Yo trabajo pase con la pared"}] },
  { id:5, userId:3, name:"Amara Diallo", av:"AD", verified:false, time:"3d", text:"Mi coach me dijo: 'El talento te abre puertas, el trabajo duro te mantiene dentro' 💯", image:null, likes:298, comments:22, liked:true, commentList:[{u:"Fatou Mbaye",t:"Verdad absoluta"},{u:"Santiago Medina",t:"Para tatuar"}] },
  { id:6, userId:13, name:"André Costa", av:"AC", verified:true, time:"4h", text:"Trabajando el regate brasileño con mi hermano menor 🇧🇷⚽ Nunca es tarde para empezar!", image:"training", likes:412, comments:38, liked:false, commentList:[{u:"Mateo Silva",t:"Eso es hermandad"},{ u:"Isabella Torres",t:"Qué lindo 💛"}] },
  { id:7, userId:10, name:"Isabella Torres", av:"IT", verified:true, time:"8h", text:"Gol en el último minuto para clasificar a semifinales! 🔥 Medellín lo hicimos!", image:"goal", likes:567, comments:89, liked:true, commentList:[{u:"Carlos Ruiz",t:"Golazo!"},{u:"André Costa",t:"Clutch 🎯"}] },
  { id:8, userId:7, name:"Aisha Kamara", av:"AK", verified:false, time:"12h", text:"Defensa no es solo quitar balones, es empezar el juego. Salida limpia > despeje largo", image:null, likes:189, comments:24, liked:false, commentList:[{u:"Valentina López",t:"Exacto!"},{u:"Moussa Keita",t:"Así se habla"}] },
  { id:9, userId:15, name:"Emiliano Vargas", av:"EV", verified:true, time:"1d", text:"Mi barrio, mi cancha, mi sueño ⚽ Callao presente! 🇵🇪", image:"game", likes:334, comments:41, liked:false, commentList:[{u:"Diego Paredes",t:"Vamos Perú!"},{u:"Sofía Morales",t:"Orgullo sudamericano"}] },
  { id:10, userId:8, name:"Mateo Silva", av:"MS", verified:true, time:"1d", text:"Hoy entrené con jugadores 3 años mayores. Me costó pero aprendí mucho 💪", image:null, likes:276, comments:33, liked:true, commentList:[{u:"Thierno Ba",t:"Esa es la actitud"},{u:"Kofi Mensah",t:"Seguí así!"}] },
  { id:11, userId:20, name:"Emmanuel Osei", av:"EO", verified:true, time:"2d", text:"Mi abuelo jugó en los 80s, mi padre en los 2000s, yo voy por el 2030 🙌🏿 Legado familiar", image:null, likes:445, comments:52, liked:false, commentList:[{u:"Aisha Kamara",t:"Qué historia!"},{u:"Zara Ndiaye",t:"Ghana power 💪🏿"}] },
  { id:12, userId:6, name:"Carlos Ruiz", av:"CR", verified:true, time:"2d", text:"Atajada del partido! A veces un portero también gana juegos ✋⚽", image:"game", likes:389, comments:47, liked:true, commentList:[{u:"Camila Reyes",t:"Porteros unidos!"},{u:"Santiago Medina",t:"Salvaste el partido"}] },
  { id:13, userId:17, name:"Camila Reyes", av:"CRe", verified:true, time:"3d", text:"Ser la única chica en un equipo de hombres no me asusta, me motiva 💪 #RompiendoEsquemas", image:null, likes:678, comments:92, liked:true, commentList:[{u:"Isabella Torres",t:"Inspiradora!"},{u:"Lucía Fernández",t:"Así se hace! 🔥"}] },
  { id:14, userId:11, name:"Thierno Ba", av:"TB", verified:false, time:"3d", text:"El fútbol me enseñó a ser paciente. A veces el pase correcto es esperar un segundo más", image:null, likes:234, comments:28, liked:false, commentList:[{u:"Amara Diallo",t:"Filosofía pura"},{u:"Mateo Silva",t:"Verdad"}] },
  { id:15, userId:19, name:"Sofía Morales", av:"SMo", verified:false, time:"4d", text:"Paraguay 🇵🇾 Pequeño pero con mucho corazón! Entrenando para el sudamericano sub-16", image:"training", likes:312, comments:35, liked:false, commentList:[{u:"Emiliano Vargas",t:"Vamos Paraguay!"},{u:"Valentina López",t:"Sudamérica unida"}] },
];

const CHATS = [
  { id:1, name:"Lucía Fernández", av:"LF", last:"¡Gracias por el consejo!", time:"10m", unread:2 },
  { id:2, name:"Comunidad Rosario", av:"🌎", last:"Diego: ¿Alguien para entrenar?", time:"1h", unread:15, group:true },
  { id:3, name:"Santiago Medina", av:"SM", last:"Tu último video está increíble", time:"3h", unread:0 },
];

const SPECIALISTS = [
  { id:"coach", name:"Coach", emoji:"⚽", color:"#00E676", desc:"Tu mentor personal", intro:"¡Hola! Soy Coach, estoy aquí 24/7 para lo que necesites." },
  { id:"nutricion", name:"Nutrición", emoji:"🥗", color:"#FFB74D", desc:"Alimentación deportiva", intro:"Hola, puedo ayudarte a comer mejor con lo que tengas." },
  { id:"psicologia", name:"Psicología", emoji:"🧠", color:"#BA68FF", desc:"Bienestar emocional", intro:"Este es un espacio seguro. Puedes contarme lo que sientes." },
  { id:"tecnica", name:"Técnica", emoji:"🎯", color:"#40C4FF", desc:"Entrenamiento y táctica", intro:"Envíame videos y te ayudo a mejorar." },
  { id:"carrera", name:"Carrera", emoji:"🚀", color:"#FF5252", desc:"Camino profesional", intro:"Te ayudo con contratos, becas y oportunidades." },
];

const QUICK_PROMPTS = {
  coach:["¿Cómo manejo la presión?","Me siento estancado/a","Dame motivación","No tengo recursos"],
  nutricion:["¿Qué comer antes de entrenar?","Comida económica","Foto de mi plato","Subir masa muscular"],
  psicologia:["Tengo ansiedad","No me siento suficiente","Extraño a mi familia","Perdí un partido importante"],
  tecnica:["Analiza este video","Ejercicios sin equipo","Mejorar pierna débil","Rutina para casa"],
  carrera:["¿Cómo llamo scouts?","¿Qué es un contrato juvenil?","Becas disponibles","¿Mi perfil está listo?"],
};

const timeAgo = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `hace ${Math.floor(diff/60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff/3600)}h`;
  if (diff < 604800) return `hace ${Math.floor(diff/86400)}d`;
  return date.toLocaleDateString();
};

const V = <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853"><path d="M12 2L3.5 6.5v5c0 4.83 3.6 9.36 8.5 10.5 4.9-1.14 8.5-5.67 8.5-10.5v-5L12 2zm-1 14.59l-3.29-3.3 1.41-1.41L11 13.76l4.88-4.88 1.41 1.41L11 16.59z"/></svg>;

function AuthInline({ onSuccess, onClose, postLoginTab }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const { data, error: err } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
        if (err) throw err;
        if (data.user) {
          await supabase.from('profiles').insert([{ id: data.user.id, username: email.split('@')[0], email, full_name: fullName, avatar_url: null, bio: '', age: null, country: '', city: '', position: '', verified: false, followers_count: 0, following_count: 0 }]);
          onSuccess();
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        sessionStorage.setItem('activeTab', postLoginTab || 'home');
        onClose();
        onSuccess();
      }
    } catch (err) {
      if (err.message && !err.message.toLowerCase().includes('uninitialized')) {
        setError(err.message || 'Error. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inp = { width:'100%', padding:'10px 12px', background:'#0a0e14', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', color:'#ECEFF4', fontSize:'14px', outline:'none', fontFamily:'Outfit, sans-serif', marginBottom:'12px' };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
        <div>
          <div style={{fontSize:'20px',fontWeight:'900',color:'#00E676'}}>MiraFut</div>
          <div style={{fontSize:'13px',color:'#8899A6'}}>{isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}</div>
        </div>
        <button onClick={onClose} style={{background:'none',border:'none',color:'#8899A6',fontSize:'22px',cursor:'pointer'}}>×</button>
      </div>
      <form onSubmit={handleAuth}>
        {isSignUp && <input type="text" placeholder="Nombre completo" value={fullName} onChange={e=>setFullName(e.target.value)} required style={inp} />}
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required style={inp} />
        <input type="password" placeholder="Contraseña (mín. 6 caracteres)" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} style={inp} />
        {error && <div style={{color:'#FF5252',fontSize:'12px',marginBottom:'10px'}}>{error}</div>}
        <button type="submit" disabled={loading} style={{width:'100%',padding:'12px',background:loading?'#556677':'linear-gradient(135deg,#00E676,#00C853)',border:'none',borderRadius:'12px',color:'#0a0e14',fontSize:'15px',fontWeight:'700',cursor:'pointer',fontFamily:'Outfit, sans-serif',marginBottom:'10px'}}>
          {loading ? 'Cargando...' : isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
        </button>
      </form>
      <button onClick={() => setIsSignUp(!isSignUp)} style={{width:'100%',background:'none',border:'none',color:'#00E676',fontSize:'13px',cursor:'pointer',fontFamily:'Outfit, sans-serif',marginBottom:'8px'}}>
        {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
      </button>
      <button onClick={onClose} style={{width:'100%',background:'none',border:'none',color:'#556677',fontSize:'12px',cursor:'pointer',fontFamily:'Outfit, sans-serif'}}>
        Seguir explorando →
      </button>
    </div>
  );
}

export default function App() {
  // Auth state
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // App state - TODOS los useState ANTES de los useEffect
  const [tab, setTab] = useState(() => {
    const saved = sessionStorage.getItem('activeTab');
    if (saved) { sessionStorage.removeItem('activeTab'); return saved; }
    return 'home';
  });
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 769);
  const [viewPost, setViewPost] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);
  const [chatOpen, setChatOpen] = useState(null);
  const [chatMsg, setChatMsg] = useState("");
  const [chatMsgs, setChatMsgs] = useState([
    {id:1,text:"Vi tu último video, increíble",from:"them",time:"10:30"},
    {id:2,text:"¡Muchas gracias!",from:"me",time:"10:32"},
  ]);
  const [currentAgent, setCurrentAgent] = useState("coach");
  const [aiMessages, setAiMessages] = useState([
    { id:1, from:"coach", type:"text", text:"Hola 👋 ¿Cómo estás hoy?", time:"14:20" },
    { id:2, from:"coach", type:"suggestions", options:["Todo bien","Nervioso/a","Necesito consejo","Vengo de entrenar"], time:"14:20" },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [showSpecialists, setShowSpecialists] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [recording, setRecording] = useState(false);
  const aiEnd = useRef(null);
  const [showHealthDisclaimer, setShowHealthDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [likes, setLikes] = useState({});
  const [follows, setFollows] = useState({});
  const [newPost, setNewPost] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);
  const [realPosts, setRealPosts] = useState([]);

  const loadComments = async (postId) => {
    const realPostId = postId.toString().replace('real-', '');
    const { data } = await supabase.from('comments').select('*, profiles(full_name, avatar_url)').eq('post_id', realPostId).order('created_at', { ascending: true });
    if (data) setPostComments(data);
  };

  const addComment = async (postId) => {
    if (!newComment.trim() || !session) return;
    const realPostId = postId.toString().replace('real-', '');
    const { error } = await supabase.from('comments').insert([{ user_id: session.user.id, post_id: realPostId, content: newComment }]);
    if (!error) { setNewComment(''); loadComments(postId); loadRealPosts(); }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults({ users: [], posts: [] }); return; }
    const [usersRes, postsRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name, username, avatar_url, position, country').ilike('full_name', '%' + query + '%').limit(5),
      supabase.from('posts').select('id, content, created_at').ilike('content', '%' + query + '%').limit(5)
    ]);
    setSearchResults({ users: usersRes.data || [], posts: postsRes.data || [] });
  };

  const loadNotifications = async (userId) => {
    const { data } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (data) setNotifications(data);
  };

  const loadUserProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) { setUserProfile(data); loadRealPosts(); }
  };

  const loadRealPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, likes(count), comments(count)')
      .order('created_at', { ascending: false });
    if (!error && data) setRealPosts(data);
  };

  // Auth effect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) { loadUserProfile(session.user.id); loadNotifications(session.user.id); loadFollowing(); loadLikes(); }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) { setShowAuthPrompt(false); loadUserProfile(session.user.id); loadNotifications(session.user.id); loadFollowing(); }
      if (session && pendingTabRef.current && pendingTabRef.current !== 'home') {
        setTab(pendingTabRef.current);
        pendingTabRef.current = 'home';
      }
    });

    loadRealPosts();

    return () => subscription.unsubscribe();
  }, []);

  // Resize effect
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 769);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const agent = SPECIALISTS.find(s => s.id === currentAgent);

  useEffect(() => {
    if (tab === "coach") aiEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, thinking, tab]);

  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [postAuthTab, setPostAuthTab] = useState('home');
  const pendingTabRef = useRef('home');

  const requireAuth = (redirectTab = 'home') => {
    if (!session) {
      pendingTabRef.current = redirectTab;
      setPostAuthTab(redirectTab);
      setShowAuthPrompt(true);
      return true;
    }
    return false;
  };

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [showSearch, setShowSearch] = useState(false);
  const [postImage, setPostImage] = useState(null);
  const [postImageUrl, setPostImageUrl] = useState(null);
  const [followingList, setFollowingList] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [postComments, setPostComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editForm, setEditForm] = useState({ full_name: '', username: '', bio: '', age: '', country: '', city: '', position: '' });
  const [editLoading, setEditLoading] = useState(false);

  if (loading) {
    return <div style={{ background: '#0a0e14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ECEFF4' }}>Cargando...</div>;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get('login') && !session) {
    return <Auth onSuccess={(nextTab) => { window.history.replaceState({}, '', '/'); setTab(nextTab || 'home'); }} onExplore={() => window.history.replaceState({}, '', '/')} />;
  }

  if (!session && tab === 'chat') {
    // will be handled in nav click
  }

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    setChatMsgs([...chatMsgs, {id:Date.now(),text:chatMsg,from:"me",time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}]);
    setChatMsg("");
  };

  const sendAI = async (text) => {
    if (requireAuth()) return;
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
      const response = await sendMessageToCoach(text, currentAgent);
      setAiMessages(m => [...m, { 
        id:Date.now()+1, 
        from:currentAgent, 
        type:"text", 
        text:response, 
        time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) 
      }]);
    } catch (error) {
      console.error('Error with AI Coach:', error);
      setAiMessages(m => [...m, { 
        id:Date.now()+1, 
        from:currentAgent, 
        type:"text", 
        text:"Lo siento, hubo un error. Por favor intenta de nuevo.", 
        time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) 
      }]);
    } finally {
      setThinking(false);
    }
  };

  const switchAgent = (id) => {
    setCurrentAgent(id);
    setShowSpecialists(false);
    const a = SPECIALISTS.find(s => s.id === id);
    setAiMessages(m => [...m, { id:Date.now(), from:id, type:"handoff", text:a.intro, time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) }]);
  };

  const uploadAvatar = async (file) => {
    const ext = file.name.split('.').pop();
    const path = session.user.id + '/avatar.' + ext;
    const { error: uploadError } = await supabase.storage.from('Avatars').upload(path, file, { upsert: true });
    if (uploadError) { alert('Error subiendo foto: ' + uploadError.message); return; }
    const { data: urlData } = supabase.storage.from('Avatars').getPublicUrl(path);
    const { error: updateError } = await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', session.user.id);
  };

  const openEditProfile = async () => {
    if (!session) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (data) setEditForm({ full_name: data.full_name || '', username: data.username || '', bio: data.bio || '', age: data.age || '', country: data.country || '', city: data.city || '', position: data.position || '' });
    setShowEditProfile(true);
  };

  const saveProfile = async () => {
    setEditLoading(true);
    const { error } = await supabase.from('profiles').update({ full_name: editForm.full_name, username: editForm.username, bio: editForm.bio, age: editForm.age ? parseInt(editForm.age) : null, country: editForm.country, city: editForm.city, position: editForm.position }).eq('id', session.user.id);
    setEditLoading(false);
    if (error) { alert('Error: ' + error.message); } else { setShowEditProfile(false); alert('¡Perfil actualizado!'); }
  };



  const loadLikes = async () => {
    if (!session) return;
    const { data } = await supabase.from('likes').select('post_id').eq('user_id', session.user.id);
    if (data) setLikedPosts(data.map(l => l.post_id));
  };

  const toggleRealLike = async (postId) => {
    if (requireAuth()) return;
    const realPostId = postId.toString().replace('real-', '');
    if (!postId.toString().startsWith('real-')) return;
    const isLiked = likedPosts.includes(realPostId);
    if (isLiked) {
      await supabase.from('likes').delete().eq('user_id', session.user.id).eq('post_id', realPostId);
      setLikedPosts(prev => prev.filter(id => id !== realPostId));
    } else {
      await supabase.from('likes').insert([{ user_id: session.user.id, post_id: realPostId }]);
      setLikedPosts(prev => [...prev, realPostId]);
    }
    loadRealPosts();
  };

  const loadFollowing = async () => {
    if (!session) return;
    const [followingRes, followersRes] = await Promise.all([
      supabase.from('follows').select('following_id').eq('follower_id', session.user.id),
      supabase.from('follows').select('follower_id', { count: 'exact' }).eq('following_id', session.user.id)
    ]);
    if (followingRes.data) setFollowingList(followingRes.data.map(f => f.following_id));
    if (followersRes.count !== null) setFollowerCount(followersRes.count);
  };

  const toggleFollowUser = async (userId) => {
    if (requireAuth()) return;
    const isFollowing = followingList.includes(userId);
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', session.user.id).eq('following_id', userId);
      setFollowingList(prev => prev.filter(id => id !== userId));
    } else {
      await supabase.from('follows').insert([{ follower_id: session.user.id, following_id: userId }]);
      setFollowingList(prev => [...prev, userId]);
    }
  };

  const sharePost = async (post) => {
    const url = window.location.origin + '?post=' + post.id;
    const text = post.text || post.content || '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MiraFut — ' + (post.name || 'Post'),
          text: text.substring(0, 100),
          url: url
        });
      } catch (e) {}
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copiado al portapapeles!');
    }
  };

  const toggleLike = (postId) => {
    if (requireAuth()) return;
    setLikes(l => ({...l, [postId]: !l[postId]}));
  };
  const toggleFollow = (userId) => {
    if (requireAuth()) return;
    setFollows(f => ({...f, [userId]: !f[userId]}));
  };

  const uploadPostImage = async (file) => {
    if (!session || !file) return null;
    const ext = file.name.split('.').pop();
    const path = session.user.id + '/' + Date.now() + '.' + ext;
    const { error } = await supabase.storage.from('posts').upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from('posts').getPublicUrl(path);
    return data.publicUrl;
  };

  const createPost = async () => {
    if (requireAuth()) return;
    if (!newPost.trim()) return;
    const imageUrl = postImage ? await uploadPostImage(postImage) : null;
    const { data, error } = await supabase
      .from('posts')
      .insert([{ user_id: session.user.id, content: newPost, image_url: imageUrl }])
      .select()
      .single();
    if (error) {
      alert("Error al crear el post: " + error.message);
    } else {
      setNewPost(""); setPostImage(null); setPostImageUrl(null);
      setShowNewPost(false);
      loadRealPosts();
    }
  };

  // Merge real posts (from Supabase) at top, then hardcoded posts
  const allPosts = [
    ...realPosts.map(p => ({
      id: 'real-' + p.id,
      userId: p.user_id,
      name: userProfile?.full_name || (session ? session.user.email.split('@')[0] : 'Usuario'),
      av: userProfile?.full_name ? userProfile.full_name.substring(0,2).toUpperCase() : (session ? session.user.email.substring(0,2).toUpperCase() : 'U'),
      verified: false,
      time: timeAgo(p.created_at),
      text: p.content,
      image: p.image_url || null,
      likes: p.likes?.[0]?.count || 0,
      comments: p.comments?.[0]?.count || 0,
      liked: false,
      commentList: [],
      avatar_url: userProfile?.avatar_url || null
    })),
    ...POSTS
  ];

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@700&family=Playfair+Display:wght@700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body,#root{font-family:'Outfit',sans-serif;background:#0a0e14;color:#ECEFF4;height:100vh;overflow:hidden}
.app{max-width:480px;margin:0 auto;height:100vh;display:flex;flex-direction:column;background:#0a0e14;position:relative}
@media (min-width: 769px) {
  .app{max-width:1400px}
  .hdr{padding:16px 40px}
  .logo-text{font-size:24px}
  
  /* Desktop Hero */
  .desktop-hero{background:linear-gradient(135deg,rgba(0,230,118,0.03),rgba(0,200,83,0.01));padding:80px 40px 60px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.04)}
  .hero-title{font-size:52px;font-weight:900;background:linear-gradient(135deg,#00E676,#69F0AE);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px;font-family:'Inter',sans-serif;line-height:1.1}
  .hero-subtitle{font-size:22px;color:#8899A6;margin-bottom:32px;max-width:600px;margin-left:auto;margin-right:auto;line-height:1.4}
  .hero-stats{display:flex;gap:40px;justify-content:center;margin-top:24px}
  .hero-stat{text-align:center}
  .hero-stat-value{font-size:36px;font-weight:900;color:#00E676;font-family:'Space Mono',monospace}
  .hero-stat-label{font-size:13px;color:#556677;margin-top:4px;text-transform:uppercase;letter-spacing:1px}
}

.hdr{padding:10px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.06);background:rgba(10,14,20,0.95);backdrop-filter:blur(20px);z-index:100;min-height:60px}
.logo{display:flex;align-items:center;gap:10px}
.logo-text{font-family:'Inter','SF Pro Display',-apple-system,system-ui,sans-serif;font-weight:900;font-size:20px;color:#FFFFFF;line-height:1;letter-spacing:-0.02em}
.logo-tag{font-size:8px;letter-spacing:2.5px;color:#00E676;font-weight:700;margin-top:2px;font-family:'Inter',sans-serif}
.hb{background:none;border:none;color:#8899A6;cursor:pointer;padding:6px;border-radius:10px;font-size:18px}

.mc{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:70px}
@media (max-width: 768px) {
  .mc{padding-bottom:80px}
}
.mc::-webkit-scrollbar{width:3px}.mc::-webkit-scrollbar-thumb{background:#556677;border-radius:3px}

@media (min-width: 769px) {
  .mc{padding:20px}
  .posts-grid{display:grid;grid-template-columns:repeat(3, 1fr);gap:20px;max-width:1200px;margin:0 auto}
  .post{margin:0!important}
}

/* POST CARD */
.post{background:#121820;border:1px solid rgba(255,255,255,0.06);border-radius:18px;margin:0 16px 14px;overflow:hidden}
.poh{display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer}
.poav{width:38px;height:38px;border-radius:11px;background:rgba(0,230,118,0.12);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#00E676;flex-shrink:0}
.poi{flex:1;min-width:0}.pon{font-weight:600;font-size:13px;display:flex;align-items:center;gap:4px}.pot{font-size:11px;color:#556677}
.poc{padding:0 14px 10px;font-size:14px;line-height:1.5;color:#ECEFF4}
.pov{margin:0 14px 10px;border-radius:12px;background:linear-gradient(135deg,#0d3320,#0a1a14);height:200px;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;overflow:hidden}
.pov::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 60% 40%,rgba(0,230,118,0.1),transparent)}
.pov-label{font-size:11px;color:#8899A6;text-align:center;font-style:italic}
.poa{display:flex;padding:6px 14px 12px;gap:16px;border-top:1px solid rgba(255,255,255,0.04);margin-top:6px}
.poab{display:flex;align-items:center;gap:5px;background:none;border:none;color:#556677;font-size:12px;cursor:pointer;font-family:'Outfit';font-weight:500}
.poab.lk.on{color:#FF5252}

/* COMMENTS */
.comments{padding:10px 14px 14px;border-top:1px solid rgba(255,255,255,0.04)}
.com-title{font-size:11px;color:#8899A6;margin-bottom:8px;letter-spacing:1px;text-transform:uppercase;font-weight:600}
.com-item{display:flex;gap:8px;margin-bottom:8px}
.com-av{width:26px;height:26px;border-radius:8px;background:rgba(0,230,118,0.1);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:10px;color:#00E676;flex-shrink:0}
.com-content{flex:1;min-width:0}
.com-name{font-weight:600;font-size:12px}
.com-text{font-size:12px;color:#ECEFF4;margin-top:2px;line-height:1.4}

/* PROFILE */
.profile{padding:20px;text-align:center}
.prof-av{width:80px;height:80px;border-radius:22px;background:linear-gradient(135deg,#00E676,#00C853);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:28px;color:#0a0e14;margin:0 auto 12px}
.prof-name{font-weight:800;font-size:22px;display:flex;align-items:center;justify-content:center;gap:6px}
.prof-meta{font-size:13px;color:#8899A6;margin-top:4px}
.prof-bio{font-size:13px;color:#ECEFF4;margin:12px 20px;line-height:1.5}
.prof-stats{display:flex;gap:20px;justify-content:center;margin:16px 0;padding:16px;background:#121820;border-radius:16px;border:1px solid rgba(255,255,255,0.06)}
.prof-stat{text-align:center}
.prof-stat-v{font-weight:800;font-size:20px;color:#00E676;font-family:'Space Mono'}
.prof-stat-l{font-size:11px;color:#556677;text-transform:uppercase;letter-spacing:1px;margin-top:2px}
.prof-btn{padding:10px 24px;border-radius:11px;border:none;font-weight:700;font-size:14px;cursor:pointer;font-family:'Outfit';margin-top:10px}
.prof-btn.pri{background:linear-gradient(135deg,#00E676,#00C853);color:#0a0e14}
.prof-btn.sec{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#ECEFF4}

/* CHAT */
.cli{display:flex;align-items:center;gap:10px;padding:12px 18px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.04)}
.cav{width:44px;height:44px;border-radius:12px;background:#121820;border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#00E676;flex-shrink:0}
.cav.g{font-size:20px;background:rgba(0,230,118,0.1)}
.cin{flex:1;min-width:0}.cnm{font-weight:600;font-size:13px}.cls{font-size:12px;color:#556677;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ctm{font-size:10px;color:#556677}
.cur{background:#00E676;color:#0a0e14;font-size:10px;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;margin-top:3px;margin-left:auto;padding:0 5px}

.chat-view{display:flex;flex-direction:column;height:100%}
.chat-hdr{padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;gap:10px;background:#0d1319}
.chat-back{background:none;border:none;color:#8899A6;cursor:pointer;font-size:18px;padding:4px 8px}
.chat-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:6px}
.chat-msg{max-width:78%;padding:9px 12px;border-radius:14px;font-size:13px;line-height:1.4}
.chat-msg.them{background:#121820;border:1px solid rgba(255,255,255,0.04);align-self:flex-start;border-bottom-left-radius:4px}
.chat-msg.me{background:rgba(0,230,118,0.18);color:#ECEFF4;align-self:flex-end;border-bottom-right-radius:4px}
.chat-input{display:flex;gap:7px;padding:8px 14px;border-top:1px solid rgba(255,255,255,0.06);background:#0f1419}
.chat-input input{flex:1;background:#121820;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:8px 12px;color:#ECEFF4;font-family:'Outfit';font-size:13px;outline:none}
.chat-send{width:36px;height:36px;border-radius:10px;background:#00E676;border:none;color:#0a0e14;cursor:pointer;font-size:16px}

/* AI COACH */
.coach-screen{display:flex;flex-direction:column;height:calc(100vh - 60px - 60px);overflow:hidden}
.coach-hdr{padding:10px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(255,255,255,0.05);background:#0f1419;min-height:60px}
.ch-info{flex:1;display:flex;align-items:center;gap:10px;cursor:pointer}
.ch-av{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;position:relative;flex-shrink:0}
.ch-av::after{content:'';position:absolute;bottom:-2px;right:-2px;width:10px;height:10px;border-radius:50%;background:#00E676;border:2px solid #0f1419}
.ch-name{font-weight:700;font-size:15px;display:flex;align-items:center;gap:5px}
.ch-role{font-size:11px;color:#8899A6}

.drawer-bg{position:absolute;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(3px);z-index:200;display:${showSpecialists?'flex':'none'};align-items:flex-end}
.drawer{background:#121820;border-top-left-radius:24px;border-top-right-radius:24px;padding:20px;width:100%;border-top:1px solid rgba(255,255,255,0.08);animation:slideUp 0.25s ease}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.drawer-handle{width:40px;height:4px;background:rgba(255,255,255,0.15);border-radius:2px;margin:0 auto 16px}
.drawer-title{font-size:11px;letter-spacing:2px;color:#556677;text-transform:uppercase;margin-bottom:4px;font-weight:600}
.drawer-sub{font-weight:700;font-size:18px;margin-bottom:16px}
.spec-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.spec-card{background:#0a0e14;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:14px;cursor:pointer;transition:all 0.2s}
.spec-card.active{border-color:currentColor}
.spec-emoji{font-size:26px;margin-bottom:8px}
.spec-name{font-weight:700;font-size:14px;color:#ECEFF4}
.spec-desc{font-size:11px;color:#8899A6;margin-top:2px;line-height:1.4}

.safety-banner{margin:8px 14px 0;padding:10px 12px;background:rgba(186,104,255,0.08);border:1px solid rgba(186,104,255,0.2);border-radius:12px;display:flex;align-items:center;gap:10px;font-size:12px;color:rgba(255,255,255,0.8);line-height:1.4;flex-shrink:0}

.ai-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px}
.ai-row{display:flex;gap:8px}
.ai-row.me{justify-content:flex-end}
.ai-av{width:28px;height:28px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;margin-top:2px}
.ai-group{max-width:78%;display:flex;flex-direction:column;gap:3px}
.ai-bubble{padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.4}
.ai-them{background:#121820;border:1px solid rgba(255,255,255,0.04);border-bottom-left-radius:4px}
.ai-me{background:rgba(0,230,118,0.18);color:#ECEFF4;border-bottom-right-radius:4px}
.ai-time{font-size:10px;color:#556677;padding:0 4px}

.handoff{align-self:center;max-width:85%;background:linear-gradient(135deg,rgba(255,255,255,0.02),rgba(255,255,255,0.05));border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:12px;text-align:center;margin:4px 0}
.handoff-lbl{font-size:9px;letter-spacing:2px;color:#556677;text-transform:uppercase;margin-bottom:4px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px}
.handoff-line{flex:1;height:1px;background:rgba(255,255,255,0.08)}
.handoff-intro{font-size:12px;color:#ECEFF4;line-height:1.5;font-style:italic}

.sugs{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;margin-left:36px}
.sug{padding:7px 13px;background:#121820;border:1px solid rgba(255,255,255,0.08);border-radius:14px;font-size:12px;color:#ECEFF4;cursor:pointer;font-family:'Outfit'}

.spec-sug{background:#121820;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:12px;margin-top:4px;margin-left:36px;max-width:78%}
.spec-sug-h{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.spec-sug-i{width:36px;height:36px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:18px}
.spec-sug-n{font-weight:700;font-size:13px}
.spec-sug-r{font-size:11px;color:#8899A6}
.spec-sug-b{width:100%;padding:8px;border:none;border-radius:9px;font-weight:700;font-size:12px;cursor:pointer;font-family:'Outfit'}

.think{display:flex;gap:6px;align-items:center;align-self:flex-start;padding:10px 14px;background:#121820;border:1px solid rgba(255,255,255,0.04);border-radius:16px;border-bottom-left-radius:4px}
.dot{width:5px;height:5px;border-radius:50%;background:#8899A6;animation:blink 1.4s infinite}
.dot:nth-child(2){animation-delay:0.2s}.dot:nth-child(3){animation-delay:0.4s}
@keyframes blink{0%,60%,100%{opacity:0.3}30%{opacity:1}}

.qp-lbl{font-size:10px;color:#556677;letter-spacing:1px;padding:10px 14px 4px;text-transform:uppercase;font-weight:600}
.qps{padding:4px 14px 8px;display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;flex-shrink:0}
.qp{padding:6px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:18px;font-size:11px;color:#8899A6;cursor:pointer;white-space:nowrap;font-family:'Outfit';flex-shrink:0}

.ai-input{padding:10px 14px 14px;border-top:1px solid rgba(255,255,255,0.05);background:#0f1419;display:flex;gap:7px;align-items:flex-end;flex-shrink:0}
.ai-ibox{flex:1;background:#121820;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:9px 12px;display:flex;align-items:center;gap:7px}
.ai-att{background:none;border:none;color:#556677;cursor:pointer;font-size:16px;padding:2px}
.ai-field{flex:1;background:none;border:none;outline:none;color:#ECEFF4;font-family:'Outfit';font-size:13px;resize:none;max-height:70px;min-height:20px;line-height:1.5}
.ai-mic{width:40px;height:40px;border-radius:12px;background:${recording?'#FF5252':'#121820'};border:1px solid ${recording?'#FF5252':'rgba(255,255,255,0.06)'};color:${recording?'white':'#8899A6'};cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.ai-send{width:40px;height:40px;border-radius:12px;background:${aiInput.trim()?'#00E676':'#121820'};border:none;color:${aiInput.trim()?'#0a0e14':'#556677'};cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;font-weight:bold}

/* HEALTH DISCLAIMER MODAL */
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

/* HEALTH DISCLAIMER */
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
        ) : tab === "coach" ? (
          <div className="coach-hdr">
            <div className="ch-info" onClick={() => setShowSpecialists(true)}>
              <div className="ch-av" style={{ background:`${agent.color}20`, color:agent.color }}>{agent.emoji}</div>
              <div style={{flex:1}}>
                <div className="ch-name">{agent.name} <span style={{fontSize:11,color:'#556677'}}>▾</span></div>
                <div className="ch-role">{agent.desc} · En línea</div>
              </div>
            </div>
            <button className="hb">⋯</button>
          </div>
        ) : (
          <div className="hdr">
            <div className="logo" onClick={()=>{setTab("home");setViewPost(null);setViewProfile(null);setChatOpen(null);}} style={{cursor:"pointer"}}>
              <svg width="36" height="36" viewBox="0 0 64 64">
                <rect width="64" height="64" rx="14" fill="#00E676"/>
                <path d="M8,32 Q32,6 56,32 Q32,58 8,32 Z" fill="#0a0e14"/>
                <path d="M13,32 Q32,11 51,32 Q32,53 13,32 Z" fill="#00E676"/>
                <circle cx="32" cy="32" r="5.5" fill="#0a0e14"/>
                <line x1="32" y1="32" x2="36.5" y2="27.5" stroke="#00E676" strokeWidth="1.3" strokeLinecap="round"/>
                <circle cx="37" cy="27" r="1.5" fill="#00E676"/>
              </svg>
              <div>
                <div className="logo-text">MiraFut</div>
                <div className="logo-tag">TALENTO SIN FRONTERAS</div>
              </div>
            </div>
            <div style={{flex:1,margin:"0 12px",position:"relative"}}>
              <input
                value={searchQuery}
                onChange={e => { handleSearch(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
                placeholder="🔍 Buscar..."
                style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px",padding:"7px 12px",color:"#ECEFF4",fontSize:"13px",outline:"none",fontFamily:"Outfit, sans-serif"}}
              />
              {showSearch && searchQuery && (searchResults.users.length > 0 || searchResults.posts.length > 0) && (
                <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#121820",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",marginTop:"4px",zIndex:1000,maxHeight:"300px",overflowY:"auto"}}>
                  {searchResults.users.length > 0 && <div style={{padding:"8px 12px 4px",fontSize:"10px",color:"#556677",textTransform:"uppercase",letterSpacing:"1px"}}>Usuarios</div>}
                  {searchResults.users.map(u => (
                    <div key={u.id} onClick={() => { setViewProfile({id:u.id,name:u.full_name,avatar:u.full_name?.substring(0,2).toUpperCase(),avatar_url:u.avatar_url,position:u.position||'',country:u.country||'',city:'',age:'',bio:'',verified:false,followers:0,following:0}); setShowSearch(false); setSearchQuery(''); setTab('home'); }} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 12px",cursor:"pointer"}}>
                      {u.avatar_url ? <img src={u.avatar_url} style={{width:"32px",height:"32px",borderRadius:"9px",objectFit:"cover"}} /> : <div style={{width:"32px",height:"32px",borderRadius:"9px",background:"rgba(0,230,118,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"700",color:"#00E676"}}>{u.full_name?.substring(0,2).toUpperCase()}</div>}
                      <div><div style={{fontSize:"13px",fontWeight:"600",color:"#ECEFF4"}}>{u.full_name}</div><div style={{fontSize:"11px",color:"#556677"}}>{u.position} {u.country}</div></div>
                    </div>
                  ))}
                  {searchResults.posts.length > 0 && <div style={{padding:"8px 12px 4px",fontSize:"10px",color:"#556677",textTransform:"uppercase",letterSpacing:"1px",borderTop:"1px solid rgba(255,255,255,0.04)"}}>Posts</div>}
                  {searchResults.posts.map(p => (
                    <div key={p.id} onClick={() => { setShowSearch(false); setSearchQuery(''); }} style={{padding:"8px 12px",cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                      <div style={{fontSize:"13px",color:"#ECEFF4",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="hb" onClick={() => setShowNotifications(true)} style={{position:"relative"}}>
                🔔
                {notifications.filter(n => !n.read).length > 0 && <span style={{position:"absolute",top:"-2px",right:"-2px",background:"#FF5252",color:"white",fontSize:"9px",fontWeight:"700",minWidth:"16px",height:"16px",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>{notifications.filter(n => !n.read).length}</span>}
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
                <div className="hero-stat-value">20</div>
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
                <div key={p.id} className="post">
                  <div className="poh" onClick={() => setViewProfile(USERS.find(u=>u.id===p.userId))}>
                    {p.avatar_url ? <img src={p.avatar_url} style={{width:"38px",height:"38px",borderRadius:"11px",objectFit:"cover",flexShrink:0}} /> : <div className="poav">{p.av}</div>}
                    <div className="poi">
                      <div className="pon">{p.name} {p.verified && V}</div>
                      <div className="pot">{p.time}</div>
                    </div>
                  </div>
                  <div className="poc">{p.text}</div>
                  {p.image && (
                    <div className="pov">
                      {p.image.startsWith('http') ? <img src={p.image} style={{width:'100%',height:'200px',objectFit:'cover'}} /> : <div className="pov-label">📷 {p.image === 'game' ? 'Foto del partido' : p.image === 'training' ? 'Entrenamiento' : 'Celebración del gol'}</div>}
                    </div>
                  )}
                  <div className="poa">
                    <button className={`poab lk ${(p.id.toString().startsWith('real-') ? likedPosts.includes(p.id.toString().replace('real-','')) : (likes[p.id] || p.liked)) ? 'on' : ''}`} onClick={() => p.id.toString().startsWith('real-') ? toggleRealLike(p.id) : toggleLike(p.id)}>
                      {(p.id.toString().startsWith('real-') ? likedPosts.includes(p.id.toString().replace('real-','')) : (likes[p.id] || p.liked)) ? '❤️' : '🤍'} {p.likes + (likedPosts.includes(p.id.toString().replace('real-','')) ? 1 : 0)}
                    </button>
                    <button className="poab" onClick={() => { setViewPost(p); loadComments(p.id); }}>💬 {p.comments}</button>
                    <button className="poab" onClick={() => sharePost(p)}>🔗 Compartir</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ====== POST DETAIL WITH COMMENTS ====== */}
          {viewPost && (
            <div style={{padding:'0 0 20px'}}>
              <button className="hb" style={{margin:'10px 16px'}} onClick={() => setViewPost(null)}>← Volver al feed</button>
              <div className="post" style={{margin:'0 16px 14px'}}>
                <div className="poh" onClick={() => setViewProfile(USERS.find(u=>u.id===viewPost.userId))}>
                  <div className="poav">{viewPost.av}</div>
                  <div className="poi">
                    <div className="pon">{viewPost.name} {viewPost.verified && V}</div>
                    <div className="pot">{viewPost.time}</div>
                  </div>
                </div>
                <div className="poc">{viewPost.text}</div>
                {viewPost.image && (
                  <div className="pov">
                    <div className="pov-label">📷 Imagen del post</div>
                  </div>
                )}
                <div className="poa">
                  <button className={`poab lk ${(likes[viewPost.id] || viewPost.liked)?'on':''}`} onClick={() => toggleLike(viewPost.id)}>
                    {(likes[viewPost.id] || viewPost.liked) ? '❤️' : '🤍'} {viewPost.likes + (likes[viewPost.id] && !viewPost.liked ? 1 : 0)}
                  </button>
                  <button className="poab">💬 {viewPost.comments}</button>
                  <button className="poab" onClick={() => sharePost(p)}>🔗 Compartir</button>
                </div>
                <div className="comments">
                  <div className="com-title">Comentarios</div>
                  {postComments.length === 0 && viewPost.commentList.length === 0 && <div style={{color:'#556677',fontSize:'13px',padding:'8px 0'}}>No hay comentarios aún. ¡Sé el primero!</div>}
                  {postComments.length > 0 ? postComments.map((c,i) => (
                    <div key={i} className="com-item">
                      <div className="com-av">{c.profiles?.full_name ? c.profiles.full_name.substring(0,2).toUpperCase() : 'U'}</div>
                      <div className="com-content">
                        <div className="com-name">{c.profiles?.full_name || 'Usuario'}</div>
                        <div className="com-text">{c.content}</div>
                      </div>
                    </div>
                  )) : viewPost.commentList.map((c,i) => (
                    <div key={i} className="com-item">
                      <div className="com-av">{c.u.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
                      <div className="com-content">
                        <div className="com-name">{c.u}</div>
                        <div className="com-text">{c.t}</div>
                      </div>
                    </div>
                  ))}
                  {session && viewPost.id.toString().startsWith('real-') && <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
                    <input value={newComment} onChange={e=>setNewComment(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addComment(viewPost.id)} placeholder="Escribe un comentario..." style={{flex:1,background:'#0a0e14',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'8px 12px',color:'#ECEFF4',fontSize:'13px',outline:'none',fontFamily:'Outfit, sans-serif'}} />
                    <button onClick={()=>addComment(viewPost.id)} style={{padding:'8px 14px',background:'#00E676',border:'none',borderRadius:'10px',color:'#0a0e14',fontWeight:'700',cursor:'pointer',fontSize:'13px'}}>→</button>
                  </div>}
                </div>
              </div>
            </div>
          )}

          {/* ====== PROFILE VIEW ====== */}
          {viewProfile && (
            <div className="profile">
              {viewProfile.avatar_url ? <img src={viewProfile.avatar_url} style={{width:"80px",height:"80px",borderRadius:"22px",objectFit:"cover",margin:"0 auto 12px",display:"block"}} /> : <div className="prof-av">{viewProfile.avatar}</div>}
              <div className="prof-name">{viewProfile.name} {viewProfile.verified && V}</div>
              <div className="prof-meta">📍 {viewProfile.city}, {viewProfile.country} · {viewProfile.age} años · {viewProfile.position}</div>
              <div className="prof-bio">{viewProfile.bio}</div>
              <div className="prof-stats">
                <div className="prof-stat"><div className="prof-stat-v">{viewProfile.followers}</div><div className="prof-stat-l">Seguidores</div></div>
                <div className="prof-stat"><div className="prof-stat-v">{viewProfile.following}</div><div className="prof-stat-l">Siguiendo</div></div>
                <div className="prof-stat"><div className="prof-stat-v">{POSTS.filter(p=>p.userId===viewProfile.id).length}</div><div className="prof-stat-l">Posts</div></div>
              </div>
              <button className={`prof-btn ${followingList.includes(viewProfile.id) || follows[viewProfile.id] ? 'sec' : 'pri'}`} onClick={() => toggleFollowUser(viewProfile.id)}>
                {followingList.includes(viewProfile.id) || follows[viewProfile.id] ? 'Siguiendo ✓' : '+ Seguir'}
              </button>
              <button className="prof-btn sec" onClick={() => setChatOpen(1)}>💬 Mensaje</button>
            </div>
          )}

          {/* ====== CHAT LIST ====== */}
          {tab === "chat" && !chatOpen && (
            <div>{CHATS.map(c => (
              <div key={c.id} className="cli" onClick={() => setChatOpen(c.id)}>
                <div className={`cav ${c.group?'g':''}`}>{c.av}</div>
                <div className="cin">
                  <div className="cnm">{c.name}</div>
                  <div className="cls">{c.last}</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div className="ctm">{c.time}</div>
                  {c.unread>0 && <div className="cur">{c.unread}</div>}
                </div>
              </div>
            ))}</div>
          )}

          {/* ====== CHAT VIEW ====== */}
          {chatOpen && (
            <div className="chat-view">
              <div className="chat-msgs">
                {chatMsgs.map(m => (
                  <div key={m.id} className={`chat-msg ${m.from}`}>{m.text}</div>
                ))}
              </div>
              <div className="chat-input">
                <input placeholder="Escribe..." value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key==='Enter' && sendChat()}/>
                <button className="chat-send" onClick={sendChat}>→</button>
              </div>
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

              <div className="ai-msgs">
                {aiMessages.map(m => {
                  const ma = SPECIALISTS.find(s => s.id === m.from);
                  if (m.type === "handoff") {
                    return <div key={m.id} className="handoff"><div className="handoff-lbl"><div className="handoff-line"/><span>{ma.name} se unió</span><div className="handoff-line"/></div><div className="handoff-intro">"{m.text}"</div></div>;
                  }
                  if (m.type === "suggestions") {
                    return <div key={m.id} className="sugs">{m.options.map(o=><button key={o} className="sug" onClick={()=>sendAI(o)}>{o}</button>)}</div>;
                  }
                  if (m.type === "specialist-card") {
                    const sp = SPECIALISTS.find(s => s.id === m.specialist);
                    return <div key={m.id} className="spec-sug"><div className="spec-sug-h"><div className="spec-sug-i" style={{background:`${sp.color}20`,color:sp.color}}>{sp.emoji}</div><div><div className="spec-sug-n">{sp.name}</div><div className="spec-sug-r">{sp.desc}</div></div></div><button className="spec-sug-b" style={{background:sp.color,color:'#0a0e14'}} onClick={()=>switchAgent(m.specialist)}>Conectar con {sp.name} →</button></div>;
                  }
                  return (
                    <div key={m.id} className={`ai-row ${m.from==='me'?'me':''}`}>
                      {m.from !== 'me' && <div className="ai-av" style={{background:`${ma?.color||'#00E676'}20`,color:ma?.color||'#00E676'}}>{ma?.emoji}</div>}
                      <div className="ai-group">
                        <div className={`ai-bubble ${m.from==='me'?'ai-me':'ai-them'}`}>{m.text}</div>
                        <div className="ai-time" style={{textAlign:m.from==='me'?'right':'left'}}>{m.time}</div>
                      </div>
                    </div>
                  );
                })}
                {thinking && <div className="ai-row"><div className="ai-av" style={{background:`${agent.color}20`,color:agent.color}}>{agent.emoji}</div><div className="think"><div className="dot"/><div className="dot"/><div className="dot"/></div></div>}
                <div ref={aiEnd} />
              </div>

              {aiMessages.length <= 3 && (
                <>
                  <div className="qp-lbl">Sugerencias</div>
                  <div className="qps">{QUICK_PROMPTS[currentAgent].map(p=><button key={p} className="qp" onClick={()=>sendAI(p)}>{p}</button>)}</div>
                </>
              )}

              <div className="ai-input">
                <div className="ai-ibox">
                  <button className="ai-att" title="Foto">📷</button>
                  <button className="ai-att" title="Video">🎥</button>
                  <textarea className="ai-field" placeholder={`Escríbele a ${agent.name}...`} value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendAI(aiInput);}}} rows={1}/>
                </div>
                {aiInput.trim() ? (
                  <button className="ai-send" onClick={()=>sendAI(aiInput)}>→</button>
                ) : (
                  <button className="ai-mic" onMouseDown={()=>setRecording(true)} onMouseUp={()=>setRecording(false)} onMouseLeave={()=>setRecording(false)}>🎤</button>
                )}
              </div>

              <div className="drawer-bg" onClick={()=>setShowSpecialists(false)}>
                <div className="drawer" onClick={e=>e.stopPropagation()}>
                  <div className="drawer-handle"/>
                  <div className="drawer-title">Elige con quién hablar</div>
                  <div className="drawer-sub">Tu equipo de apoyo</div>
                  <div className="spec-grid">
                    {SPECIALISTS.map(s=>(
                      <div key={s.id} className={`spec-card ${currentAgent===s.id?'active':''}`} style={{color:s.color}} onClick={()=>switchAgent(s.id)}>
                        <div className="spec-emoji">{s.emoji}</div>
                        <div className="spec-name">{s.name}</div>
                        <div className="spec-desc">{s.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ====== MY PROFILE ====== */}
          {tab === "profile" && (
            <div className="profile">
              {userProfile?.avatar_url ? <img src={userProfile.avatar_url} style={{width:"80px",height:"80px",borderRadius:"22px",objectFit:"cover"}} /> : <div className="prof-av">{userProfile?.full_name ? userProfile.full_name.substring(0,2).toUpperCase() : "TU"}</div>}
              <div className="prof-name">{userProfile?.full_name || 'Tu nombre'}</div>
              <div className="prof-meta">Completa tu perfil para conectar con la comunidad</div>
              <div className="prof-stats">
                <div className="prof-stat"><div className="prof-stat-v">{followerCount}</div><div className="prof-stat-l">Seguidores</div></div>
                <div className="prof-stat"><div className="prof-stat-v">{followingList.length}</div><div className="prof-stat-l">Siguiendo</div></div>
                <div className="prof-stat"><div className="prof-stat-v">{realPosts.length}</div><div className="prof-stat-l">Posts</div></div>
              </div>
              <button className="prof-btn pri" onClick={openEditProfile}>Editar perfil</button>
              <button className="prof-btn sec">⚙️ Configuración</button>
              <button className="prof-btn sec" style={{marginTop:"8px",color:"#FF5252",borderColor:"rgba(255,82,82,0.3)"}} onClick={() => { supabase.auth.signOut(); setSession(null); setTab("home"); }}>🚪 Cerrar sesión</button>
              {realPosts.length > 0 && <div style={{width:"100%",marginTop:"20px",textAlign:"left"}}><div style={{fontSize:"11px",color:"#556677",letterSpacing:"1px",textTransform:"uppercase",fontWeight:"600",marginBottom:"12px"}}>Mis posts</div>{realPosts.map(p => <div key={p.id} style={{background:"#0a0e14",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"14px",padding:"12px",marginBottom:"10px"}}><div style={{fontSize:"14px",color:"#ECEFF4"}}>{p.content}</div><div style={{fontSize:"11px",color:"#556677",marginTop:"6px"}}>{new Date(p.created_at).toLocaleDateString()}</div></div>)}</div>}
            </div>
          )}
        </div>

        {/* FLOATING ACTION BUTTON */}
        {tab === "home" && !viewPost && !viewProfile && (
          <button className="fab" onClick={() => { if (requireAuth()) return; setShowNewPost(true); }}>+</button>
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
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div className="modal-title">Nuevo post</div>
              <button className="modal-close" onClick={() => setShowNewPost(false)}>×</button>
            </div>
            <textarea className="modal-textarea" placeholder="¿Qué está pasando?" value={newPost} onChange={e => setNewPost(e.target.value)}/>
            {postImageUrl && <div style={{marginTop:'10px',borderRadius:'12px',overflow:'hidden',position:'relative'}}>
              <img src={postImageUrl} style={{width:'100%',maxHeight:'200px',objectFit:'cover',borderRadius:'12px'}} />
              <button onClick={()=>{setPostImage(null);setPostImageUrl(null);}} style={{position:'absolute',top:'8px',right:'8px',background:'rgba(0,0,0,0.6)',border:'none',color:'white',borderRadius:'50%',width:'24px',height:'24px',cursor:'pointer',fontSize:'14px'}}>×</button>
            </div>}
            <div className="modal-actions">
              <label className="modal-btn sec" style={{cursor:'pointer',flex:'0 0 auto'}}>
                📷 Foto
                <input type="file" accept="image/*" style={{display:'none'}} onChange={e => { if(e.target.files[0]) { setPostImage(e.target.files[0]); setPostImageUrl(URL.createObjectURL(e.target.files[0])); } }} />
              </label>
              <button className="modal-btn pri" onClick={createPost}>Publicar</button>
            </div>
          </div>
        </div>

        {/* EDIT PROFILE MODAL */}
        {showEditProfile && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:99999,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(4px)',overflowY:'auto'}}>
            <div style={{background:'#121820',borderRadius:'20px',padding:'28px',maxWidth:'440px',width:'100%',border:'1px solid rgba(255,255,255,0.08)'}}>
              <div style={{textAlign:'center',marginBottom:'20px'}}>
                {userProfile?.avatar_url ? <img src={userProfile.avatar_url} style={{width:'80px',height:'80px',borderRadius:'22px',objectFit:'cover',marginBottom:'8px',display:'block',margin:'0 auto 8px'}} /> : <div style={{width:'80px',height:'80px',borderRadius:'22px',background:'linear-gradient(135deg,#00E676,#00C853)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px',fontWeight:'800',color:'#0a0e14',margin:'0 auto 8px'}}>{userProfile?.full_name ? userProfile.full_name.substring(0,2).toUpperCase() : 'TU'}</div>}
                <label style={{cursor:'pointer',color:'#00E676',fontSize:'13px',fontWeight:'600'}}>
                  📷 Cambiar foto
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={e => e.target.files[0] && uploadAvatar(e.target.files[0])} />
                </label>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                <div style={{fontWeight:'700',fontSize:'18px'}}>Editar perfil</div>
                <button onClick={() => setShowEditProfile(false)} style={{background:'none',border:'none',color:'#8899A6',fontSize:'22px',cursor:'pointer'}}>×</button>
              </div>
              {[
                { label: 'Nombre completo', key: 'full_name', placeholder: 'Tu nombre' },
                { label: 'Usuario', key: 'username', placeholder: '@usuario' },
                { label: 'Biografía', key: 'bio', placeholder: 'Cuéntanos sobre ti' },
                { label: 'Edad', key: 'age', placeholder: 'Tu edad', type: 'number' },
                { label: 'País', key: 'country', placeholder: 'Tu país' },
                { label: 'Ciudad', key: 'city', placeholder: 'Tu ciudad' },
              ].map(f => (
                <div key={f.key} style={{marginBottom:'14px'}}>
                  <label style={{display:'block',color:'#8899A6',fontSize:'12px',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'1px'}}>{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    value={editForm[f.key]}
                    onChange={e => setEditForm(prev => ({...prev, [f.key]: e.target.value}))}
                    placeholder={f.placeholder}
                    style={{width:'100%',padding:'10px 12px',background:'#0a0e14',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',color:'#ECEFF4',fontSize:'14px',outline:'none',fontFamily:'Outfit, sans-serif'}}
                  />
                </div>
              ))}
              <div style={{marginBottom:'20px'}}>
                <label style={{display:'block',color:'#8899A6',fontSize:'12px',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'1px'}}>Posición</label>
                <select value={editForm.position} onChange={e => setEditForm(prev => ({...prev, position: e.target.value}))} style={{width:'100%',padding:'10px 12px',background:'#0a0e14',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',color:'#ECEFF4',fontSize:'14px',outline:'none',fontFamily:'Outfit, sans-serif'}}>
                  <option value="">Selecciona tu posición</option>
                  <option value="POR">Portero</option>
                  <option value="DEF">Defensa</option>
                  <option value="MED">Mediocampista</option>
                  <option value="DEL">Delantero</option>
                </select>
              </div>
              <button onClick={saveProfile} disabled={editLoading} style={{width:'100%',padding:'13px',background:editLoading?'#556677':'linear-gradient(135deg,#00E676,#00C853)',border:'none',borderRadius:'12px',color:'#0a0e14',fontSize:'15px',fontWeight:'700',cursor:'pointer',fontFamily:'Outfit, sans-serif'}}>
                {editLoading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS PANEL */}
        {showNotifications && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:99999,display:"flex",alignItems:"flex-start",justifyContent:"flex-end",padding:"70px 20px 20px",backdropFilter:"blur(4px)"}} onClick={()=>setShowNotifications(false)}>
            <div style={{background:"#121820",borderRadius:"20px",padding:"20px",width:"320px",border:"1px solid rgba(255,255,255,0.08)",maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
                <div style={{fontWeight:"700",fontSize:"16px"}}>Notificaciones</div>
                <button onClick={()=>setShowNotifications(false)} style={{background:"none",border:"none",color:"#8899A6",fontSize:"20px",cursor:"pointer"}}>×</button>
              </div>
              {notifications.length === 0 ? (
                <div style={{color:"#556677",fontSize:"14px",textAlign:"center",padding:"20px"}}>No tienes notificaciones</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} onClick={() => { if(n.post_id) { setShowNotifications(false); setViewPost(allPosts.find(p => p.id === "real-"+n.post_id) || null); setTab("home"); } }} style={{padding:"12px",borderRadius:"12px",background:n.read?"transparent":"rgba(0,230,118,0.05)",border:"1px solid",borderColor:n.read?"rgba(255,255,255,0.04)":"rgba(0,230,118,0.15)",marginBottom:"8px",cursor:n.post_id?"pointer":"default"}}>
                    <div style={{fontSize:"13px",color:"#ECEFF4"}}>{n.message}</div>
                    <div style={{fontSize:"11px",color:"#556677",marginTop:"4px"}}>{new Date(n.created_at).toLocaleDateString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* AUTH PROMPT MODAL */}
        {showAuthPrompt && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:99999,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(4px)'}}>
            <div style={{background:'#121820',borderRadius:'20px',padding:'32px',maxWidth:'400px',width:'100%',border:'1px solid rgba(255,255,255,0.08)'}}>
              <AuthInline 
                onSuccess={() => {
                  setShowAuthPrompt(false);
                }}
                onClose={() => setShowAuthPrompt(false)}
                postLoginTab={postAuthTab}
              />
            </div>
          </div>
        )}

        {/* BOTTOM NAV */}
        <nav className="bnav">
          <button className={`ni ${tab==='home'?'on':''}`} onClick={()=>{setTab('home');setViewPost(null);setViewProfile(null);setChatOpen(null);}}><span className="ni-emoji">🏠</span><span>Inicio</span></button>
          <button className={`ni ${tab==='coach'?'on':''}`} onClick={()=>{ if(!session){requireAuth();return;} setTab('coach');setChatOpen(null);}}><span className="ni-emoji">⚽</span><span>Coach</span></button>
          <button className={`ni ${tab==='chat'?'on':''}`} onClick={()=>{ if(!session){requireAuth();return;} setTab('chat');setChatOpen(null);}}><span className="ni-emoji">💬</span><span>Chat</span>{CHATS.reduce((s,c)=>s+c.unread,0)>0 && <span className="nbg">{CHATS.reduce((s,c)=>s+c.unread,0)}</span>}</button>
          <button className={`ni ${tab==='profile'?'on':''}`} onClick={()=>{ if(!session){requireAuth('profile');return;} setTab('profile');setViewPost(null);setViewProfile(null);setChatOpen(null);}}><span className="ni-emoji">👤</span><span>Perfil</span></button>
        </nav>
      </div>
    </>
  );
}
