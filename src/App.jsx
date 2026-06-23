import { supabase } from './supabaseClient';
import { translations, getLanguage } from './translations';
import Auth from './Auth';
import { sendMessageToCoach } from './openaiClient';
import { useState, useRef, useEffect, useMemo } from "react";

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

const IMG = {
  game:     'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80&fit=crop&auto=format',
  training: 'https://images.unsplash.com/photo-1552318965-6e6be7484ada?w=600&q=80&fit=crop&auto=format',
  goal:     'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=600&q=80&fit=crop&auto=format',
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

function V() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853"><path d="M12 2L3.5 6.5v5c0 4.83 3.6 9.36 8.5 10.5 4.9-1.14 8.5-5.67 8.5-10.5v-5L12 2zm-1 14.59l-3.29-3.3 1.41-1.41L11 13.76l4.88-4.88 1.41 1.41L11 16.59z"/></svg>; }

function AuthInline({ onSuccess, onClose, postLoginTab }) {
  const tl = translations['es'];
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
  const [lang, setLang] = useState(getLanguage);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // App state - TODOS los useState ANTES de los useEffect
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [postAuthTab, setPostAuthTab] = useState('home');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [showSearch, setShowSearch] = useState(false);
  const [postImage, setPostImage] = useState(null);
  const [postImageUrl, setPostImageUrl] = useState(null);
  const [followingList, setFollowingList] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [debate, setDebate] = useState(null);
  const [debateVotes, setDebateVotes] = useState([]);
  const [debateComments, setDebateComments] = useState([]);
  const [debateComment, setDebateComment] = useState('');
  const [userVote, setUserVote] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editForm, setEditForm] = useState({ full_name: '', username: '', bio: '', age: '', country: '', city: '', position: '', height: '', weight: '', dominant_foot: '', goal: '' });
  const [editLoading, setEditLoading] = useState(false);
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
  const [realChatMsgs, setRealChatMsgs] = useState([]);
  const [chatPartner, setChatPartner] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
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
  const pendingTabRef = useRef('home');
  const agent = SPECIALISTS.find(s => s.id === currentAgent);
  const t = useMemo(() => translations[lang], [lang]);
  const toggleLang = () => { const nl = lang === 'es' ? 'en' : 'es'; setLang(nl); localStorage.setItem('mirafut_lang', nl); };
  const [showHealthDisclaimer, setShowHealthDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);
  const [realPosts, setRealPosts] = useState([]);
  const [postsPage, setPostsPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const loaderRef = useRef(null);

  const loadComments = async (postId) => {
    const realPostId = postId.toString().replace('real-', '');
    const { data } = await supabase.from('comments').select('*, profiles(full_name, avatar_url)').eq('post_id', realPostId).order('created_at', { ascending: true });
    if (data) setPostComments(data);
  };

  const addComment = async (postId) => {
    if (!newComment.trim() || !session || !session.user || submittingComment) return;
    setSubmittingComment(true);
    const realPostId = postId.toString().replace('real-', '');
    const { error } = await supabase.from('comments').insert([{ user_id: session.user.id, post_id: realPostId, content: newComment }]);
    if (!error) { setNewComment(''); loadComments(postId); loadRealPosts(); }
    setSubmittingComment(false);
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

  const markNotificationsRead = async () => {
    if (!session || !session.user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', session.user.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({...n, read: true})));
  };

  const loadNotifications = async (userId) => {
    const { data } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (data) setNotifications(data);
  };

  const loadUserProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) { setUserProfile(data); loadRealPosts(); }
  };

  const loadDebate = async () => {
    const { data } = await supabase
      .from('debates')
      .select('*')
      .gte('ends_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (data) {
      setDebate(data);
      const { data: votes } = await supabase
        .from('debate_votes')
        .select('option_index, user_id')
        .eq('debate_id', data.id);
      if (votes) setDebateVotes(votes);
      if (session) {
        const myVote = votes?.find(v => v.user_id === session.user.id);
        if (myVote) setUserVote(myVote.option_index);
      }
      const { data: comments } = await supabase
        .from('debate_comments')
        .select('*, profiles(full_name, avatar_url)')
        .eq('debate_id', data.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (comments) setDebateComments(comments);
    }
  };

  const voteDebate = async (optionIndex) => {
    if (requireAuth()) return;
    if (userVote !== null) return;
    const { error } = await supabase.from('debate_votes').insert([{
      debate_id: debate.id,
      user_id: session.user.id,
      option_index: optionIndex
    }]);
    if (!error) {
      setUserVote(optionIndex);
      setDebateVotes(prev => [...prev, { option_index: optionIndex, user_id: session.user.id }]);
    }
  };

  const sendDebateComment = async () => {
    if (!debateComment.trim() || requireAuth()) return;
    const { error } = await supabase.from('debate_comments').insert([{
      debate_id: debate.id,
      user_id: session.user.id,
      content: debateComment
    }]);
    if (!error) { setDebateComment(''); loadDebate(); }
  };

  const loadRealPosts = async (page = 0, append = false) => {
    const PAGE_SIZE = 10;
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(full_name, avatar_url, verified), likes(count), comments(count)')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (!error && data) {
      if (data.length < PAGE_SIZE) setHasMorePosts(false);
      else setHasMorePosts(true);
      if (append) setRealPosts(prev => [...prev, ...data]);
      else setRealPosts(data);
    }
  };

  // Auth effect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);

    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    loadRealPosts();
    loadDebate();

    return () => subscription.unsubscribe();
  }, []);

  // Reaccionar a cambios de session
  useEffect(() => {
    if (session) {
      loadUserProfile(session.user.id);
      loadNotifications(session.user.id);
      loadFollowing();
      loadLikes();
      loadChatList();
      setShowAuthPrompt(false);
      supabase.from('profiles').select('position').eq('id', session.user.id).single().then(({ data }) => {
        if (!data?.position) { setShowOnboarding(true); setOnboardingStep(1); }
      });
    }
  }, [session]);

  // Mostrar FAB al scrollear
  useEffect(() => {
    const checkScroll = () => {
      const el = document.querySelector('.mc');
      const y = el ? el.scrollTop : window.scrollY;
      setShowFab(y > 400);
    };
    const el = document.querySelector('.mc');
    if (el) el.addEventListener('scroll', checkScroll);
    window.addEventListener('scroll', checkScroll);
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('scroll', checkScroll);
    };
  }, []);

  // Scroll infinito
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMorePosts) {
        const nextPage = postsPage + 1;
        setPostsPage(nextPage);
        loadRealPosts(nextPage, true);
      }
    }, { threshold: 0.1 });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [postsPage, hasMorePosts]);

  // Chat polling - refresca mensajes cada 5 segundos cuando el chat está abierto
  useEffect(() => {
    if (!chatOpen || !session) return;
    const interval = setInterval(() => {
      loadMessages(chatOpen);
    }, 5000);
    return () => clearInterval(interval);
  }, [chatOpen, session]);

  // Contador mensajes no leídos - refresca cada 30 segundos
  useEffect(() => {
    if (!session) return;
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('to_user_id', session.user.id)
        .eq('read', false);
      setUnreadMessages(count || 0);
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [session]);

  // Resize effect
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 769);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (tab === "coach") aiEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, thinking, tab]);

  const requireAuth = (redirectTab = 'home') => {
    if (!session) {
      pendingTabRef.current = redirectTab;
      setPostAuthTab(redirectTab);
      setShowAuthPrompt(true);
      return true;
    }
    return false;
  };

  // ── Debate ────────────────────────────────────────────


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
    if (data) setEditForm({ full_name: data.full_name || '', username: data.username || '', bio: data.bio || '', age: data.age || '', country: data.country || '', city: data.city || '', position: data.position || '', height: data.height || '', weight: data.weight || '', dominant_foot: data.dominant_foot || '', goal: data.goal || '' });
    setShowEditProfile(true);
  };

  const saveProfile = async () => {
    setEditLoading(true);
    const { error } = await supabase.from('profiles').update({ full_name: editForm.full_name, username: editForm.username, bio: editForm.bio, age: editForm.age ? parseInt(editForm.age) : null, country: editForm.country, city: editForm.city, position: editForm.position, height: editForm.height ? parseInt(editForm.height) : null, weight: editForm.weight ? parseInt(editForm.weight) : null, dominant_foot: editForm.dominant_foot || null, goal: editForm.goal || null }).eq('id', session.user.id);
    setEditLoading(false);
    if (error) { console.error('Error actualizando perfil:', error.message); } else { setShowEditProfile(false); loadUserProfile(session.user.id); }
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

  const loadChatList = async () => {
    const { data: { session: cs } } = await supabase.auth.getSession();
    if (!cs) return;
    const userId = cs.user.id;
    const { data } = await supabase
      .from('messages')
      .select('from_user_id, to_user_id, content, created_at')
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (!data) return;
    const partnerIds = [...new Set(data.map(m => m.from_user_id === userId ? m.to_user_id : m.from_user_id))];
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', partnerIds);
    const list = partnerIds.map(pid => {
      const last = data.find(m => m.from_user_id === pid || m.to_user_id === pid);
      const profile = profiles?.find(p => p.id === pid);
      return { id: pid, name: profile?.full_name || 'Usuario', avatar_url: profile?.avatar_url, lastMsg: last?.content || '', time: last?.created_at };
    });
    setChatList(list);
  };

  const loadMessages = async (partnerId) => {
    if (!session) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(from_user_id.eq.${session.user.id},to_user_id.eq.${partnerId}),and(from_user_id.eq.${partnerId},to_user_id.eq.${session.user.id})`)
      .order('created_at', { ascending: true });
    if (data) setRealChatMsgs(data);
  };

  const saveOnboarding = async () => {
    if (!session) return;
    await supabase.from('profiles').update({
      full_name: editForm.full_name || null,
      username: editForm.username || null,
      bio: editForm.bio || null,
      age: editForm.age ? parseInt(editForm.age) : null,
      country: editForm.country || null,
      city: editForm.city || null,
      position: editForm.position || null,
      height: editForm.height ? parseInt(editForm.height) : null,
      weight: editForm.weight ? parseInt(editForm.weight) : null,
      dominant_foot: editForm.dominant_foot || null,
      goal: editForm.goal || null,
    }).eq('id', session.user.id);
    setShowOnboarding(false);
    loadUserProfile(session.user.id);
  };

  const sendRealMessage = async (partnerId) => {
    if (!chatMsg.trim() || !session) return;
    const msg = chatMsg.trim();
    setChatMsg('');
    const { error: msgError } = await supabase.from('messages').insert([{
      from_user_id: session.user.id,
      to_user_id: partnerId,
      content: msg,
      read: false
    }]);
    if (msgError) { console.error('Error sending message:', msgError); return; }
    loadMessages(partnerId);
    loadChatList();
  };

  const openChat = async (partner) => {
    setChatPartner(partner);
    setChatOpen(partner.id);
    setViewProfile(null);
    await loadMessages(partner.id);
    setTab('chat');
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
  const COUNTRIES = [...new Set([...USERS.map(u => u.country)])].sort();

  const allPosts = [
    ...realPosts.map(p => ({
      id: 'real-' + p.id,
      userId: p.user_id,
      name: p.profiles?.full_name || 'Usuario',
      av: (p.profiles?.full_name || 'U').substring(0, 2).toUpperCase(),
      verified: p.profiles?.verified || false,
      time: timeAgo(p.created_at),
      text: p.content,
      image: p.image_url || null,
      likes: p.likes?.[0]?.count || 0,
      comments: p.comments?.[0]?.count || 0,
      liked: false,
      commentList: [],
      avatar_url: p.profiles?.avatar_url || null
    })),
    ...POSTS
  ];

  const filteredPosts = allPosts
    .filter(p => !filterPosition || (USERS.find(u => u.id === p.userId)?.position === filterPosition))
    .filter(p => !filterCountry || (USERS.find(u => u.id === p.userId)?.country === filterCountry));

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
.post{background:#121820;border:1px solid rgba(255,255,255,0.06);border-radius:20px;margin:0 16px 16px;overflow:hidden}
.poh{display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer}
.poav{width:40px;height:40px;border-radius:12px;background:rgba(0,230,118,0.12);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#00E676;flex-shrink:0}
.poi{flex:1;min-width:0}.pon{font-weight:700;font-size:14px;display:flex;align-items:center;gap:4px}.pot{font-size:11px;color:#556677;margin-top:2px}
.pos-badge{font-size:10px;font-weight:800;padding:3px 9px;border-radius:20px;letter-spacing:1px;background:rgba(0,230,118,0.12);color:#00E676}
.poc{padding:0 14px 10px;font-size:14px;line-height:1.6;color:#ECEFF4}
.pov{position:relative;height:260px;overflow:hidden;cursor:pointer}
.pov img{width:100%;height:100%;object-fit:cover}
.pov-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.85) 100%)}
.pov-user{position:absolute;bottom:12px;left:12px;right:12px;display:flex;align-items:center;gap:10px}
.pov-badge{position:absolute;top:12px;right:12px;font-size:11px;font-weight:800;padding:4px 10px;border-radius:20px;letter-spacing:1px;background:#00E676;color:#0a0e14}
.pov-name{color:#fff;font-weight:700;font-size:14px}
.pov-meta{color:rgba(255,255,255,0.6);font-size:11px;margin-top:1px}
.poa{display:flex;align-items:center;padding:4px 8px 12px;border-top:1px solid rgba(255,255,255,0.04);margin-top:4px}
.poab{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;background:none;border:none;color:#8899A6;font-size:13px;cursor:pointer;font-family:'Outfit';font-weight:600;padding:8px}
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
.cli{display:flex;align-items:center;gap:12px;padding:14px 16px;cursor:pointer;margin:4px 12px;border-radius:16px;background:#121820;border:1px solid rgba(255,255,255,0.04)}
.cav{width:48px;height:48px;border-radius:14px;background:rgba(0,230,118,0.1);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;color:#00E676;flex-shrink:0}
.cav.g{font-size:22px;background:rgba(0,230,118,0.1)}
.cin{flex:1;min-width:0}.cnm{font-weight:700;font-size:14px;color:#ECEFF4;margin-bottom:3px}.cls{font-size:12px;color:#556677;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ctm{font-size:11px;color:#556677;margin-bottom:2px}
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

.drawer-bg{position:absolute;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(3px);z-index:200;align-items:flex-end}
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

.sugs{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;margin-left:36px}
.sug{padding:9px 16px;background:rgba(0,230,118,0.08);border:1.5px solid rgba(0,230,118,0.3);border-radius:20px;font-size:13px;color:#00E676;cursor:pointer;font-family:'Outfit';font-weight:600;transition:all 0.2s}
.sug:hover{background:rgba(0,230,118,0.15);border-color:#00E676}

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

.qp-lbl{font-size:10px;color:#556677;letter-spacing:1px;padding:10px 14px 4px;text-transform:uppercase;font-weight:700}
.qps{padding:4px 14px 10px;display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;flex-shrink:0}
.qp{padding:8px 14px;background:rgba(0,230,118,0.06);border:1px solid rgba(0,230,118,0.2);border-radius:20px;font-size:12px;color:#00E676;cursor:pointer;white-space:nowrap;font-family:'Outfit';flex-shrink:0;font-weight:600}

.ai-input{padding:10px 14px 14px;border-top:1px solid rgba(255,255,255,0.05);background:#0f1419;display:flex;gap:7px;align-items:flex-end;flex-shrink:0}
.ai-ibox{flex:1;background:#121820;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:9px 12px;display:flex;align-items:center;gap:7px}
.ai-att{background:none;border:none;color:#556677;cursor:pointer;font-size:16px;padding:2px}
.ai-field{flex:1;background:none;border:none;outline:none;color:#ECEFF4;font-family:'Outfit';font-size:13px;resize:none;max-height:70px;min-height:20px;line-height:1.5}
.ai-mic{width:40px;height:40px;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.ai-send{width:40px;height:40px;border-radius:12px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;font-weight:bold}

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

.fab{position:fixed;bottom:calc(80px + env(safe-area-inset-bottom));right:16px;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#00E676,#00C853);box-shadow:0 8px 24px rgba(0,230,118,0.4);border:none;color:#0a0e14;font-size:24px;cursor:pointer;z-index:100;display:flex;align-items:center;justify-content:center;font-weight:300}
      `}</style>

      <div className="app">
        {/* HEADER */}
        {chatOpen ? (
          <div className="chat-hdr">
            <button className="chat-back" onClick={() => setChatOpen(null)}>←</button>
            <span style={{fontWeight:600,fontSize:14}}>{chatPartner?.name || 'Chat'}</span>
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
                <div className="logo-tag">{t.tagline}</div>
              </div>
            </div>
            <div style={{flex:1,margin:"0 12px",position:"relative"}}>
              {isDesktop ? (
              <input
                value={searchQuery}
                onChange={e => { handleSearch(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
                placeholder={t.search}
                style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px",padding:"7px 12px",color:"#ECEFF4",fontSize:"13px",outline:"none",fontFamily:"Outfit, sans-serif"}}
              />
              ) : (
              <div onClick={() => setShowSearch(s => !s)} style={{display:"flex",alignItems:"center",justifyContent:"center",width:"36px",height:"36px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px",cursor:"pointer",fontSize:"16px"}}>🔍</div>
              )}
              {!isDesktop && showSearch && (
              <div style={{position:"fixed",top:"60px",left:0,right:0,padding:"10px 16px",background:"#0a0e14",borderBottom:"1px solid rgba(255,255,255,0.08)",zIndex:200}}>
                <input autoFocus value={searchQuery} onChange={e => { handleSearch(e.target.value); }} onBlur={() => { if(!searchQuery) setShowSearch(false); }} placeholder={t.search} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px",padding:"10px 14px",color:"#ECEFF4",fontSize:"14px",outline:"none",fontFamily:"Outfit, sans-serif"}} />
              </div>
              )}
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
            <button onClick={toggleLang} style={{background:"none",border:"none",cursor:"pointer",padding:"4px",fontSize:"22px",marginRight:"4px",lineHeight:"1"}}>{lang === "es" ? "🇺🇸" : "🇪🇸"}</button>
            <button className="hb" onClick={() => { setShowNotifications(true); markNotificationsRead(); }} style={{position:"relative"}}>
                🔔
                {notifications.filter(n => !n.read).length > 0 && <span style={{position:"absolute",top:"-2px",right:"-2px",background:"#FF5252",color:"white",fontSize:"9px",fontWeight:"700",minWidth:"16px",height:"16px",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>{notifications.filter(n => !n.read).length}</span>}
              </button>
          </div>
        )}

        {/* DESKTOP HERO SECTION */}
        {isDesktop && tab === "home" && !viewPost && !viewProfile && (
          <div className="desktop-hero">
            <h1 className="hero-title">{t.heroTitle}</h1>
            <p className="hero-subtitle">
              {t.heroSubtitle}
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
          {/* ====== FILTROS ====== */}
          {tab === "home" && !viewPost && !viewProfile && (
            <div style={{padding:'10px 16px 4px',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
              <div style={{display:'flex',gap:'6px',overflowX:'auto',scrollbarWidth:'none',marginBottom:'8px'}}>
                {['','POR','DEF','MED','DEL'].map(pos => (
                  <button key={pos} onClick={() => setFilterPosition(pos)} style={{padding:'7px 16px',background:filterPosition===pos?'#00E676':'#121820',border:filterPosition===pos?'none':'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',color:filterPosition===pos?'#0a0e14':'#8899A6',fontSize:'12px',fontWeight:'700',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'Outfit,sans-serif',flexShrink:0}}>
                    {pos === '' ? 'Todos' : pos === 'POR' ? '🧤 POR' : pos === 'DEF' ? '🛡️ DEF' : pos === 'MED' ? '⚙️ MED' : '⚡ DEL'}
                  </button>
                ))}
              </div>
              <div style={{display:'flex',gap:'6px',overflowX:'auto',scrollbarWidth:'none'}}>
                <button onClick={() => setFilterCountry('')} style={{padding:'6px 14px',background:filterCountry===''?'rgba(0,230,118,0.1)':'#121820',border:filterCountry===''?'1px solid #00E676':'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',color:filterCountry===''?'#00E676':'#8899A6',fontSize:'11px',fontWeight:'700',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'Outfit,sans-serif',flexShrink:0}}>🌍 Todos</button>
                {COUNTRIES.map(c => (
                  <button key={c} onClick={() => setFilterCountry(c)} style={{padding:'6px 14px',background:filterCountry===c?'rgba(0,230,118,0.1)':'#121820',border:filterCountry===c?'1px solid #00E676':'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',color:filterCountry===c?'#00E676':'#8899A6',fontSize:'11px',fontWeight:'700',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'Outfit,sans-serif',flexShrink:0}}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === "home" && !viewPost && !viewProfile && showFab && (
          <button className="fab" onClick={() => { if (requireAuth()) return; setShowNewPost(true); }}>+</button>
        )}

        {tab === "home" && !viewPost && !viewProfile && session && (<div style={{padding:"8px 16px 0"}}><button onClick={() => setShowNewPost(true)} style={{width:"100%",padding:"12px 16px",background:"#121820",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",color:"#556677",fontSize:"14px",cursor:"pointer",fontFamily:"Outfit,sans-serif",textAlign:"left",display:"flex",alignItems:"center",gap:"10px"}}><div style={{width:"32px",height:"32px",borderRadius:"10px",background:"rgba(0,230,118,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",flexShrink:0}}>✏️</div><span>¿Qué está pasando en el campo?</span></button></div>)}

          {/* ====== DEBATE DE LA SEMANA ====== */}
          {tab === "home" && !viewPost && !viewProfile && debate && (
            <div style={{margin:'16px 16px 4px',background:'#121820',borderRadius:'20px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.06)'}}>
              <div style={{background:'#00E676',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <span style={{fontSize:'18px'}}>🔥</span>
                  <div>
                    <div style={{fontSize:'10px',fontWeight:'800',letterSpacing:'2px',color:'#0a0e14',opacity:0.7}}>DEBATE DE LA SEMANA</div>
                    <div style={{fontSize:'11px',color:'#0a0e14',opacity:0.6}}>{Math.max(0,Math.ceil((new Date(debate.ends_at)-new Date())/(1000*60*60*24)))} días restantes</div>
                  </div>
                </div>
                <div style={{background:'rgba(0,0,0,0.15)',padding:'4px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'700',color:'#0a0e14'}}>{debateVotes.length} {debateVotes.length === 1 ? 'voto' : 'votos'}</div>
              </div>
              <div style={{padding:'16px 16px 12px'}}>
                <div style={{fontSize:'17px',fontWeight:'800',color:'#ECEFF4',lineHeight:'1.3',marginBottom:'4px'}}>{debate.question}</div>
                <div style={{fontSize:'12px',color:'#556677'}}>Vota y deja tu opinión 👇</div>
              </div>
              <div style={{padding:'0 16px 16px',display:'flex',flexDirection:'column',gap:'10px'}}>
                {(Array.isArray(debate.options) ? debate.options : JSON.parse(debate.options)).map((opt, i) => {
                  const count = debateVotes.filter(v => v.option_index === i).length;
                  const pct = debateVotes.length > 0 ? Math.round(count / debateVotes.length * 100) : 0;
                  const voted = userVote === i;
                  return (
                    <div key={i} onClick={() => voteDebate(i)} style={{position:'relative',borderRadius:'12px',overflow:'hidden',cursor:userVote === null ? 'pointer' : 'default'}}>
                      {userVote !== null && <div style={{position:'absolute',inset:0,background:voted?'rgba(0,230,118,0.15)':'rgba(255,255,255,0.03)',width:`${pct}%`}}/>}
                      <div style={{position:'relative',padding:'13px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',border:voted?'1.5px solid #00E676':'1px solid rgba(255,255,255,0.12)',borderRadius:'12px',transition:'all 0.2s'}}>
                        <span style={{fontSize:'14px',fontWeight:'700',color:voted?'#00E676':'#ECEFF4'}}>{userVote===null?'👆 ':''}{opt}</span>
                        {userVote !== null && <span style={{fontSize:'14px',fontWeight:'800',color:voted?'#00E676':'#8899A6'}}>{pct}%</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {debateComments.length > 0 && (
                <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'12px 16px'}}>
                  <div style={{fontSize:'11px',color:'#556677',textTransform:'uppercase',letterSpacing:'1px',fontWeight:'700',marginBottom:'10px'}}>Opiniones</div>
                  {debateComments.filter(c => c.content && c.content.trim()).slice(0,2).map((c,i) => (
                    <div key={i} style={{display:'flex',gap:'8px',marginBottom:'8px'}}>
                      <div style={{width:'28px',height:'28px',borderRadius:'9px',background:'rgba(0,230,118,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:'800',color:'#00E676',flexShrink:0}}>{c.profiles?.full_name?c.profiles.full_name.substring(0,2).toUpperCase():'U'}</div>
                      <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'10px',padding:'8px 10px',flex:1}}>
                        <div style={{fontSize:'12px',fontWeight:'700',color:'#ECEFF4'}}>{c.profiles?.full_name||'Usuario'}</div>
                        <div style={{fontSize:'12px',color:'#8899A6',marginTop:'2px'}}>{c.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{padding:'10px 16px 14px',display:'flex',gap:'8px'}}>
                <input value={debateComment} onChange={e=>setDebateComment(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendDebateComment()} placeholder="Tu opinión..." style={{flex:1,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'8px 12px',fontSize:'13px',color:'#ECEFF4',outline:'none',fontFamily:'Outfit,sans-serif'}} />
                <button onClick={sendDebateComment} style={{width:'36px',height:'36px',background:'#00E676',border:'none',borderRadius:'10px',color:'#0a0e14',cursor:'pointer',fontSize:'16px'}}>→</button>
              </div>
            </div>
          )}

          {/* ====== HOME FEED ====== */}
          {tab === "home" && !viewPost && !viewProfile && (
            <div className="posts-grid">
              {filteredPosts.map(p => (
                <div key={p.id} className="post">
                  {p.image ? (
                    <div className="pov" onClick={() => setViewProfile(USERS.find(u=>u.id===p.userId))}>
                      <img src={IMG[p.image] || p.image} alt="" />
                      <div className="pov-overlay"/>
                      {p.position && <div className="pov-badge">{p.position}</div>}
                      <div className="pov-user">
                        {p.avatar_url ? <img src={p.avatar_url} style={{width:'40px',height:'40px',borderRadius:'12px',objectFit:'cover',border:'2px solid #00E676',flexShrink:0}} /> : <div className="poav">{p.av}</div>}
                        <div>
                          <div className="pov-name">{p.name} {p.verified && <V/>}</div>
                          <div className="pov-meta">{p.time}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="poh" onClick={() => setViewProfile(USERS.find(u=>u.id===p.userId))}>
                      {p.avatar_url ? <img src={p.avatar_url} style={{width:'40px',height:'40px',borderRadius:'12px',objectFit:'cover',flexShrink:0}} /> : <div className="poav">{p.av}</div>}
                      <div className="poi">
                        <div className="pon">{p.name} {p.verified && <V/>}</div>
                        <div className="pot">{p.time}</div>
                      </div>
                      {p.position && <div className="pos-badge">{p.position}</div>}
                    </div>
                  )}
                  <div className="poc">{p.text}</div>
                  <div className="poa">
                    <button className={`poab lk ${(p.id.toString().startsWith('real-') ? likedPosts.includes(p.id.toString().replace('real-','')) : p.liked) ? 'on' : ''}`} onClick={() => p.id.toString().startsWith('real-') ? toggleRealLike(p.id) : null}>
                      {(p.id.toString().startsWith('real-') ? likedPosts.includes(p.id.toString().replace('real-','')) : p.liked) ? '❤️' : '🤍'} {p.likes}
                    </button>
                    <button className="poab" onClick={() => { setViewPost(p); loadComments(p.id); }}>💬 {p.comments}</button>
                    <button className="poab" onClick={() => sharePost(p)}>{t.share}</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ====== POST DETAIL WITH COMMENTS ====== */}
          {viewPost && (
            <div style={{padding:'0 0 20px'}}>
              <button className="hb" style={{margin:'10px 16px'}} onClick={() => setViewPost(null)}>{t.backToFeed}</button>
              <div className="post" style={{margin:'0 16px 14px'}}>
                <div className="poh" onClick={() => setViewProfile(USERS.find(u=>u.id===viewPost.userId))}>
                  <div className="poav">{viewPost.av}</div>
                  <div className="poi">
                    <div className="pon">{viewPost.name} {viewPost.verified && <V/>}</div>
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
                  <button className={`poab lk ${(viewPost.id.toString().startsWith('real-') ? likedPosts.includes(viewPost.id.toString().replace('real-','')) : viewPost.liked) ? 'on' : ''}`} onClick={() => viewPost.id.toString().startsWith('real-') ? toggleRealLike(viewPost.id) : null}>
                    {(viewPost.id.toString().startsWith('real-') ? likedPosts.includes(viewPost.id.toString().replace('real-','')) : viewPost.liked) ? '❤️' : '🤍'} {viewPost.likes}
                  </button>
                  <button className="poab">💬 {viewPost.comments}</button>
                  <button className="poab" onClick={() => sharePost(p)}>{t.share}</button>
                </div>
                <div className="comments">
                  <div className="com-title">{t.comments}</div>
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
                    <input value={newComment} onChange={e=>setNewComment(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addComment(viewPost.id)} placeholder={t.writeComment} style={{flex:1,background:'#0a0e14',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'8px 12px',color:'#ECEFF4',fontSize:'13px',outline:'none',fontFamily:'Outfit, sans-serif'}} />
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
              <div className="prof-name">{viewProfile.name} {viewProfile.verified && <V/>}</div>
              <div className="prof-meta">📍 {viewProfile.city}, {viewProfile.country} · {viewProfile.age} años · {viewProfile.position}</div>
              <div className="prof-bio">{viewProfile.bio}</div>
              <div className="prof-stats">
                <div className="prof-stat"><div className="prof-stat-v">{viewProfile.followers}</div><div className="prof-stat-l">Seguidores</div></div>
                <div className="prof-stat"><div className="prof-stat-v">{viewProfile.following}</div><div className="prof-stat-l">Siguiendo</div></div>
                <div className="prof-stat"><div className="prof-stat-v">{POSTS.filter(p=>p.userId===viewProfile.id).length}</div><div className="prof-stat-l">Posts</div></div>
              </div>
              <button className={`prof-btn ${followingList.includes(viewProfile.id) ? 'sec' : 'pri'}`} onClick={() => toggleFollowUser(viewProfile.id)}>
                {followingList.includes(viewProfile.id) ? 'Siguiendo ✓' : '+ Seguir'}
              </button>
              <button className="prof-btn sec" onClick={() => openChat({id: viewProfile.id, name: viewProfile.name, avatar_url: viewProfile.avatar_url})}>💬 Mensaje</button>
            </div>
          )}

          {/* ====== CHAT LIST ====== */}
          {tab === "chat" && !chatOpen && (
            <div>
              {chatList.length === 0 && (
                <div style={{textAlign:'center',color:'#556677',fontSize:'13px',marginTop:'60px',padding:'20px'}}>
                  <div style={{fontSize:'32px',marginBottom:'12px'}}>💬</div>
                  <div>No tienes conversaciones aún.</div>
                  <div style={{marginTop:'8px'}}>Busca un jugador y envíale un mensaje.</div>
                </div>
              )}
              {chatList.map(c => (
                <div key={c.id} className="cli" onClick={() => openChat(c)}>
                  {c.avatar_url ? <img src={c.avatar_url} style={{width:'48px',height:'48px',borderRadius:'14px',objectFit:'cover',flexShrink:0}} /> : <div className="cav">{c.name?.substring(0,2).toUpperCase()}</div>}
                  <div className="cin">
                    <div className="cnm">{c.name}</div>
                    <div className="cls">{c.lastMsg?.substring(0,40)}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div className="ctm">{c.time ? timeAgo(c.time) : ''}</div>
                  </div>
                </div>
              ))}

              {/* Jugadores sugeridos */}
              <div style={{padding:'20px 16px 8px'}}>
                <div style={{fontSize:'11px',color:'#556677',textTransform:'uppercase',letterSpacing:'1px',fontWeight:'700',marginBottom:'12px'}}>Jugadores que quizás conozcas</div>
                {USERS.filter(u => !chatList.find(c => c.id === u.id)).slice(0,4).map(u => (
                  <div key={u.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <div style={{width:'44px',height:'44px',borderRadius:'13px',background:'rgba(0,230,118,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:'800',color:'#00E676',flexShrink:0}}>{u.av}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:'14px',fontWeight:'700',color:'#ECEFF4'}}>{u.name}</div>
                      <div style={{fontSize:'12px',color:'#556677'}}>{u.position} · {u.country}</div>
                    </div>
                    <button onClick={() => openChat({id:u.id, name:u.name, avatar_url:u.avatar_url})} style={{padding:'7px 14px',background:'rgba(0,230,118,0.1)',border:'1px solid rgba(0,230,118,0.3)',borderRadius:'20px',color:'#00E676',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'Outfit,sans-serif',whiteSpace:'nowrap'}}>Mensaje</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ====== CHAT VIEW ====== */}
          {chatOpen && chatPartner && (
            <div className="chat-view">
              <div className="chat-msgs">
                {realChatMsgs.map(m => (
                  <div key={m.id} className={`chat-msg ${m.from_user_id === session?.user?.id ? 'me' : 'them'}`}>
                    <div>{m.content}</div>
                    <div style={{fontSize:'10px',opacity:0.5,marginTop:'2px'}}>{timeAgo(m.created_at)}</div>
                  </div>
                ))}
                {realChatMsgs.length === 0 && (
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,padding:'40px 20px',textAlign:'center'}}>
                    <div style={{width:'64px',height:'64px',borderRadius:'20px',background:'rgba(0,230,118,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px',marginBottom:'14px'}}>
                      {chatPartner?.avatar_url ? <img src={chatPartner.avatar_url} style={{width:'64px',height:'64px',borderRadius:'20px',objectFit:'cover'}} /> : <span style={{fontSize:'22px',fontWeight:'800',color:'#00E676'}}>{chatPartner?.name?.substring(0,2).toUpperCase()}</span>}
                    </div>
                    <div style={{fontSize:'16px',fontWeight:'700',color:'#ECEFF4',marginBottom:'6px'}}>{chatPartner?.name}</div>
                    <div style={{fontSize:'13px',color:'#556677',lineHeight:'1.5',maxWidth:'220px'}}>Aún no hay mensajes. ¡Sé el primero en escribir!</div>
                    <div style={{marginTop:'20px',padding:'10px 20px',background:'rgba(0,230,118,0.08)',border:'1px solid rgba(0,230,118,0.2)',borderRadius:'20px',fontSize:'13px',color:'#00E676',cursor:'pointer',fontWeight:'600'}} onClick={() => document.querySelector('.chat-input input')?.focus()}>
                      Enviar un mensaje 💬
                    </div>
                  </div>
                )}
              </div>
              <div className="chat-input">
                <input placeholder="Escribe un mensaje..." value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key==='Enter' && sendRealMessage(chatPartner.id)}/>
                <button className="chat-send" onClick={() => sendRealMessage(chatPartner.id)}>→</button>
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
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px 20px',textAlign:'center'}}>
                    <div style={{width:'64px',height:'64px',borderRadius:'20px',background:`${agent.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'32px',marginBottom:'12px'}}>{agent.emoji}</div>
                    <div style={{fontSize:'16px',fontWeight:'800',color:'#ECEFF4',marginBottom:'6px'}}>{agent.name}</div>
                    <div style={{fontSize:'13px',color:'#556677',lineHeight:'1.5',maxWidth:'240px'}}>{agent.desc}</div>
                    <div style={{marginTop:'16px',padding:'12px 16px',background:'rgba(255,255,255,0.03)',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.06)',fontSize:'13px',color:'#8899A6',lineHeight:'1.5',maxWidth:'260px',fontStyle:'italic'}}>"{agent.intro}"</div>
                  </div>
                  <div className="qp-lbl">Sugerencias</div>
                  <div className="qps">{QUICK_PROMPTS[currentAgent].map(p=><button key={p} className="qp" onClick={()=>sendAI(p)}>{p}</button>)}</div>
                </>
              )}

              <div className="ai-input">
                <div className="ai-ibox">
                  <textarea className="ai-field" placeholder={`Escríbele a ${agent.name}...`} value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendAI(aiInput);}}} rows={1}/>
                </div>
                {aiInput.trim() ? (
                  <button className="ai-send" style={{background:aiInput.trim()?"#00E676":"#121820",color:aiInput.trim()?"#0a0e14":"#556677"}} onClick={()=>sendAI(aiInput)}>→</button>
                ) : (
                  <button className="ai-mic" style={{background:recording?"#FF5252":"#121820",border:`1px solid ${recording?"#FF5252":"rgba(255,255,255,0.06)"}`,color:recording?"white":"#8899A6"}} onMouseDown={()=>setRecording(true)} onMouseUp={()=>setRecording(false)} onMouseLeave={()=>setRecording(false)}>🎤</button>
                )}
              </div>

              <div className="drawer-bg" style={{display:showSpecialists?"flex":"none"}} onClick={()=>setShowSpecialists(false)}>
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
              <div className="prof-meta">{userProfile?.position ? `${userProfile.position} · ` : ''}{userProfile?.city ? `${userProfile.city}, ` : ''}{userProfile?.country}{userProfile?.age ? ` · ${userProfile.age} años` : ''}</div>
              {!userProfile?.country && <div style={{color:'#00E676',fontSize:'12px',marginTop:'4px'}}>✨ Completa tu perfil para que los scouts te encuentren</div>}
              <div className="prof-stats">
                <div className="prof-stat"><div className="prof-stat-v">{followerCount}</div><div className="prof-stat-l">Seguidores</div></div>
                <div className="prof-stat"><div className="prof-stat-v">{followingList.length}</div><div className="prof-stat-l">Siguiendo</div></div>
                <div className="prof-stat"><div className="prof-stat-v">{realPosts.length}</div><div className="prof-stat-l">Posts</div></div>
              </div>
              {(userProfile?.height || userProfile?.weight || userProfile?.dominant_foot) && (
                <div style={{width:'100%',background:'#0a0e14',borderRadius:'16px',padding:'14px',marginTop:'12px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',textAlign:'left'}}>
                  <div style={{fontSize:'11px',color:'#556677',textTransform:'uppercase',letterSpacing:'1px',fontWeight:'700',gridColumn:'1/-1',marginBottom:'4px'}}>Datos del jugador</div>
                  {userProfile?.height && <div style={{background:'#121820',borderRadius:'12px',padding:'10px'}}><div style={{fontSize:'10px',color:'#556677',marginBottom:'4px'}}>Altura</div><div style={{fontSize:'15px',fontWeight:'700',color:'#ECEFF4'}}>{userProfile.height} cm</div></div>}
                  {userProfile?.weight && <div style={{background:'#121820',borderRadius:'12px',padding:'10px'}}><div style={{fontSize:'10px',color:'#556677',marginBottom:'4px'}}>Peso</div><div style={{fontSize:'15px',fontWeight:'700',color:'#ECEFF4'}}>{userProfile.weight} kg</div></div>}
                  {userProfile?.dominant_foot && <div style={{background:'#121820',borderRadius:'12px',padding:'10px'}}><div style={{fontSize:'10px',color:'#556677',marginBottom:'4px'}}>Pie dominante</div><div style={{fontSize:'15px',fontWeight:'700',color:'#ECEFF4'}}>{userProfile.dominant_foot}</div></div>}
                  {userProfile?.position && <div style={{background:'#121820',borderRadius:'12px',padding:'10px'}}><div style={{fontSize:'10px',color:'#556677',marginBottom:'4px'}}>Posición</div><div style={{fontSize:'15px',fontWeight:'700',color:'#00E676'}}>{userProfile.position}</div></div>}
                </div>
              )}
              {userProfile?.goal && (
                <div style={{width:'100%',background:'#0a0e14',borderRadius:'16px',padding:'14px',marginTop:'12px',textAlign:'left'}}>
                  <div style={{fontSize:'11px',color:'#556677',textTransform:'uppercase',letterSpacing:'1px',fontWeight:'700',marginBottom:'8px'}}>Objetivo</div>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <span style={{fontSize:'20px'}}>🎯</span>
                    <div style={{fontSize:'14px',color:'#ECEFF4',lineHeight:'1.4'}}>{userProfile.goal}</div>
                  </div>
                </div>
              )}
              <button className="prof-btn pri" onClick={openEditProfile}>{t.editProfile}</button>
              <button className="prof-btn sec">{t.settings}</button>
              <button className="prof-btn sec" style={{marginTop:"8px",color:"#FF5252",borderColor:"rgba(255,82,82,0.3)"}} onClick={() => { supabase.auth.signOut(); setSession(null); setTab("home"); }}>{t.logout}</button>
              {realPosts.length > 0 && (
                <div style={{width:'100%',marginTop:'20px',textAlign:'left'}}>
                  <div style={{fontSize:'11px',color:'#556677',letterSpacing:'1px',textTransform:'uppercase',fontWeight:'700',marginBottom:'12px'}}>{t.myPosts}</div>
                  {realPosts.map(p => (
                    <div key={p.id} style={{background:'#0a0e14',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'14px',padding:'14px',marginBottom:'10px',cursor:'pointer'}} onClick={() => setViewPost({...p, av: userProfile?.full_name?.substring(0,2).toUpperCase(), name: userProfile?.full_name, time: new Date(p.created_at).toLocaleDateString(), text: p.content, likes: 0, comments: 0})}>
                      <div style={{fontSize:'14px',color:'#ECEFF4',lineHeight:'1.5',marginBottom:'8px'}}>{p.content}</div>
                      {p.image_url && <img src={p.image_url} style={{width:'100%',borderRadius:'10px',marginBottom:'8px',objectFit:'cover',maxHeight:'160px'}} />}
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <div style={{fontSize:'11px',color:'#556677'}}>{new Date(p.created_at).toLocaleDateString()}</div>
                        <div style={{fontSize:'11px',color:'#556677',display:'flex',gap:'12px'}}>
                          <span>❤️ {p.likes?.[0]?.count || 0}</span>
                          <span>💬 {p.comments?.[0]?.count || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SCROLL LOADER */}
        {tab === "home" && !viewPost && !viewProfile && hasMorePosts && (
          <div ref={loaderRef} style={{height:'40px',display:'flex',alignItems:'center',justifyContent:'center',color:'#556677',fontSize:'13px',margin:'8px 0'}}>Cargando más...</div>
        )}

        {/* FLOATING ACTION BUTTON */}


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
              <div className="modal-title">{t.newPost}</div>
              <button className="modal-close" onClick={() => setShowNewPost(false)}>×</button>
            </div>
            <textarea className="modal-textarea" placeholder={t.whatsHappening} value={newPost} onChange={e => setNewPost(e.target.value)}/>
            {postImageUrl && <div style={{marginTop:'10px',borderRadius:'12px',overflow:'hidden',position:'relative'}}>
              <img src={postImageUrl} style={{width:'100%',maxHeight:'200px',objectFit:'cover',borderRadius:'12px'}} />
              <button onClick={()=>{setPostImage(null);setPostImageUrl(null);}} style={{position:'absolute',top:'8px',right:'8px',background:'rgba(0,0,0,0.6)',border:'none',color:'white',borderRadius:'50%',width:'24px',height:'24px',cursor:'pointer',fontSize:'14px'}}>×</button>
            </div>}
            <div className="modal-actions">
              <label className="modal-btn sec" style={{cursor:'pointer',flex:'0 0 auto'}}>
                📷 Foto
                <input type="file" accept="image/*" style={{display:'none'}} onChange={e => { if(e.target.files[0]) { setPostImage(e.target.files[0]); setPostImageUrl(URL.createObjectURL(e.target.files[0])); } }} />
              </label>
              <button className="modal-btn pri" onClick={createPost}>{t.publish}</button>
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
                <div style={{fontWeight:'700',fontSize:'18px'}}>{t.editProfile}</div>
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
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}}>
                <div>
                  <label style={{display:'block',color:'#8899A6',fontSize:'12px',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'1px'}}>Altura (cm)</label>
                  <input type="number" value={editForm.height} onChange={e => setEditForm(prev => ({...prev, height: e.target.value}))} placeholder="175" style={{width:'100%',padding:'10px 12px',background:'#0a0e14',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',color:'#ECEFF4',fontSize:'14px',outline:'none',fontFamily:'Outfit, sans-serif'}} />
                </div>
                <div>
                  <label style={{display:'block',color:'#8899A6',fontSize:'12px',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'1px'}}>Peso (kg)</label>
                  <input type="number" value={editForm.weight} onChange={e => setEditForm(prev => ({...prev, weight: e.target.value}))} placeholder="68" style={{width:'100%',padding:'10px 12px',background:'#0a0e14',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',color:'#ECEFF4',fontSize:'14px',outline:'none',fontFamily:'Outfit, sans-serif'}} />
                </div>
              </div>
              <div style={{marginBottom:'14px'}}>
                <label style={{display:'block',color:'#8899A6',fontSize:'12px',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'1px'}}>Pie dominante</label>
                <select value={editForm.dominant_foot} onChange={e => setEditForm(prev => ({...prev, dominant_foot: e.target.value}))} style={{width:'100%',padding:'10px 12px',background:'#0a0e14',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',color:'#ECEFF4',fontSize:'14px',outline:'none',fontFamily:'Outfit, sans-serif'}}>
                  <option value="">Selecciona</option>
                  <option value="Derecho">Derecho</option>
                  <option value="Izquierdo">Izquierdo</option>
                  <option value="Ambos">Ambos</option>
                </select>
              </div>
              <div style={{marginBottom:'20px'}}>
                <label style={{display:'block',color:'#8899A6',fontSize:'12px',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'1px'}}>Objetivo</label>
                <input type="text" value={editForm.goal} onChange={e => setEditForm(prev => ({...prev, goal: e.target.value}))} placeholder="Ej: Busco academia profesional en Europa" style={{width:'100%',padding:'10px 12px',background:'#0a0e14',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',color:'#ECEFF4',fontSize:'14px',outline:'none',fontFamily:'Outfit, sans-serif'}} />
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
                <div style={{fontWeight:"700",fontSize:"16px"}}>{t.notifications}</div>
                <button onClick={()=>setShowNotifications(false)} style={{background:"none",border:"none",color:"#8899A6",fontSize:"20px",cursor:"pointer"}}>×</button>
              </div>
              {notifications.length === 0 ? (
                <div style={{color:"#556677",fontSize:"14px",textAlign:"center",padding:"20px"}}>{t.noNotifications}</div>
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

        {/* ONBOARDING */}
        {showOnboarding && (
          <div style={{position:'fixed',inset:0,background:'#0a0e14',zIndex:99999,display:'flex',flexDirection:'column',padding:'24px',overflowY:'auto'}}>
            <div style={{textAlign:'center',marginBottom:'24px'}}>
              <svg width="56" height="56" viewBox="0 0 64 64" style={{margin:'0 auto 12px',display:'block'}}>
                <rect width="64" height="64" rx="14" fill="#00E676"/>
                <path d="M8,32 Q32,6 56,32 Q32,58 8,32 Z" fill="#0a0e14"/>
                <path d="M13,32 Q32,11 51,32 Q32,53 13,32 Z" fill="#00E676"/>
                <circle cx="32" cy="32" r="5.5" fill="#0a0e14"/>
                <line x1="32" y1="32" x2="36.5" y2="27.5" stroke="#00E676" strokeWidth="1.3" strokeLinecap="round"/>
                <circle cx="37" cy="27" r="1.5" fill="#00E676"/>
              </svg>
              <div style={{fontSize:'22px',fontWeight:'900',color:'#ECEFF4'}}>MiraFut</div>
              <div style={{fontSize:'12px',color:'#556677',letterSpacing:'2px',marginTop:'2px'}}>TALENT WITHOUT BORDERS</div>
            </div>
            <div style={{display:'flex',gap:'6px',marginBottom:'28px'}}>
              {[1,2,3].map(i => <div key={i} style={{flex:1,height:'4px',background:i<=onboardingStep?'#00E676':'rgba(255,255,255,0.1)',borderRadius:'2px'}}/>)}
            </div>
            {onboardingStep === 1 && (
              <div>
                <div style={{fontSize:'22px',fontWeight:'800',color:'#ECEFF4',marginBottom:'4px'}}>¡Bienvenido! 👋</div>
                <div style={{fontSize:'14px',color:'#556677',marginBottom:'24px'}}>Paso 1 de 3 — Tu identidad</div>
                <div style={{textAlign:'center',marginBottom:'24px'}}>
                  <label style={{cursor:'pointer'}}>
                    <div style={{width:'80px',height:'80px',borderRadius:'24px',background:'#121820',border:'2px dashed rgba(0,230,118,0.4)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',margin:'0 auto 8px'}}>
                      <span style={{fontSize:'24px'}}>📷</span>
                      <span style={{fontSize:'10px',color:'#556677',marginTop:'4px'}}>Subir foto</span>
                    </div>
                    <input type="file" accept="image/*" style={{display:'none'}} onChange={e => e.target.files[0] && uploadAvatar(e.target.files[0])} />
                  </label>
                </div>
                {[{label:'Nombre completo',key:'full_name',placeholder:'Tu nombre'},{label:'Usuario',key:'username',placeholder:'@usuario'},{label:'Biografía',key:'bio',placeholder:'Cuéntanos sobre ti...'}].map(f => (
                  <div key={f.key} style={{marginBottom:'14px'}}>
                    <div style={{fontSize:'11px',color:'#556677',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>{f.label}</div>
                    <input type="text" value={editForm[f.key]} onChange={e => setEditForm(prev=>({...prev,[f.key]:e.target.value}))} placeholder={f.placeholder} style={{width:'100%',padding:'12px 14px',background:'#121820',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',color:'#ECEFF4',fontSize:'14px',outline:'none',fontFamily:'Outfit,sans-serif'}} />
                  </div>
                ))}
              </div>
            )}
            {onboardingStep === 2 && (
              <div>
                <div style={{fontSize:'22px',fontWeight:'800',color:'#ECEFF4',marginBottom:'4px'}}>Tu posición ⚽</div>
                <div style={{fontSize:'14px',color:'#556677',marginBottom:'24px'}}>Paso 2 de 3 — Dónde juegas</div>
                <div style={{marginBottom:'14px'}}>
                  <div style={{fontSize:'11px',color:'#556677',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Posición</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                    {[{v:'POR',e:'🧤'},{v:'DEF',e:'🛡️'},{v:'MED',e:'⚙️'},{v:'DEL',e:'⚡'}].map(p => (
                      <div key={p.v} onClick={() => setEditForm(prev=>({...prev,position:p.v}))} style={{padding:'14px',background:editForm.position===p.v?'rgba(0,230,118,0.12)':'#121820',border:editForm.position===p.v?'1.5px solid #00E676':'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',cursor:'pointer',textAlign:'center'}}>
                        <div style={{fontSize:'24px',marginBottom:'4px'}}>{p.e}</div>
                        <div style={{fontSize:'13px',fontWeight:'700',color:editForm.position===p.v?'#00E676':'#ECEFF4'}}>{p.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {[{label:'País',key:'country',placeholder:'Tu país'},{label:'Ciudad',key:'city',placeholder:'Tu ciudad'},{label:'Edad',key:'age',placeholder:'Tu edad',type:'number'}].map(f => (
                  <div key={f.key} style={{marginBottom:'14px'}}>
                    <div style={{fontSize:'11px',color:'#556677',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>{f.label}</div>
                    <input type={f.type||'text'} value={editForm[f.key]} onChange={e => setEditForm(prev=>({...prev,[f.key]:e.target.value}))} placeholder={f.placeholder} style={{width:'100%',padding:'12px 14px',background:'#121820',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',color:'#ECEFF4',fontSize:'14px',outline:'none',fontFamily:'Outfit,sans-serif'}} />
                  </div>
                ))}
              </div>
            )}
            {onboardingStep === 3 && (
              <div>
                <div style={{fontSize:'22px',fontWeight:'800',color:'#ECEFF4',marginBottom:'4px'}}>Datos físicos 💪</div>
                <div style={{fontSize:'14px',color:'#556677',marginBottom:'24px'}}>Paso 3 de 3 — Para los scouts</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}}>
                  <div>
                    <div style={{fontSize:'11px',color:'#556677',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>Altura (cm)</div>
                    <input type="number" value={editForm.height} onChange={e=>setEditForm(prev=>({...prev,height:e.target.value}))} placeholder="175" style={{width:'100%',padding:'12px 14px',background:'#121820',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',color:'#ECEFF4',fontSize:'14px',outline:'none',fontFamily:'Outfit,sans-serif'}} />
                  </div>
                  <div>
                    <div style={{fontSize:'11px',color:'#556677',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>Peso (kg)</div>
                    <input type="number" value={editForm.weight} onChange={e=>setEditForm(prev=>({...prev,weight:e.target.value}))} placeholder="68" style={{width:'100%',padding:'12px 14px',background:'#121820',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',color:'#ECEFF4',fontSize:'14px',outline:'none',fontFamily:'Outfit,sans-serif'}} />
                  </div>
                </div>
                <div style={{marginBottom:'14px'}}>
                  <div style={{fontSize:'11px',color:'#556677',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Pie dominante</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}}>
                    {['Derecho','Izquierdo','Ambos'].map(p => (
                      <div key={p} onClick={() => setEditForm(prev=>({...prev,dominant_foot:p}))} style={{padding:'10px',background:editForm.dominant_foot===p?'rgba(0,230,118,0.12)':'#121820',border:editForm.dominant_foot===p?'1.5px solid #00E676':'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',cursor:'pointer',textAlign:'center',fontSize:'12px',fontWeight:'700',color:editForm.dominant_foot===p?'#00E676':'#ECEFF4'}}>
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom:'14px'}}>
                  <div style={{fontSize:'11px',color:'#556677',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>Objetivo</div>
                  <input type="text" value={editForm.goal} onChange={e=>setEditForm(prev=>({...prev,goal:e.target.value}))} placeholder="Ej: Busco academia profesional en Europa" style={{width:'100%',padding:'12px 14px',background:'#121820',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',color:'#ECEFF4',fontSize:'14px',outline:'none',fontFamily:'Outfit,sans-serif'}} />
                </div>
              </div>
            )}
            <div style={{marginTop:'auto',paddingTop:'20px'}}>
              <button onClick={() => { if(onboardingStep < 3) setOnboardingStep(s=>s+1); else saveOnboarding(); }} style={{width:'100%',padding:'14px',background:'#00E676',border:'none',borderRadius:'14px',color:'#0a0e14',fontSize:'16px',fontWeight:'800',cursor:'pointer',fontFamily:'Outfit,sans-serif'}}>
                {onboardingStep < 3 ? 'Continuar →' : '¡Empezar! 🚀'}
              </button>
              <div onClick={() => setShowOnboarding(false)} style={{textAlign:'center',marginTop:'12px',fontSize:'12px',color:'#556677',cursor:'pointer'}}>
                Completar después
              </div>
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
          <button className={`ni ${tab==='home'?'on':''}`} onClick={()=>{setTab('home');setViewPost(null);setViewProfile(null);setChatOpen(null);}}><span className="ni-emoji">🏠</span><span>{t.home}</span></button>
          <button className={`ni ${tab==='coach'?'on':''}`} onClick={()=>{ if(!session){requireAuth();return;} setTab('coach');setChatOpen(null);}}><span className="ni-emoji">⚽</span><span>{t.coach}</span></button>
          <button className={`ni ${tab==='chat'?'on':''}`} onClick={()=>{ if(!session){requireAuth();return;} setTab('chat');setChatOpen(null);loadChatList();}}><span className="ni-emoji">💬</span><span>{t.chat}</span>{unreadMessages>0 && <span className="nbg">{unreadMessages}</span>}</button>
          <button className={`ni ${tab==='profile'?'on':''}`} onClick={()=>{ if(!session){requireAuth('profile');return;} setTab('profile');setViewPost(null);setViewProfile(null);setChatOpen(null);}}><span className="ni-emoji">👤</span><span>{t.profile}</span></button>
        </nav>
      </div>
    </>
  );
}
// rebuild Fri Jun 19 21:00:10 EDT 2026

