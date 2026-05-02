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

const V = <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853"><path d="M12 2L3.5 6.5v5c0 4.83 3.6 9.36 8.5 10.5 4.9-1.14 8.5-5.67 8.5-10.5v-5L12 2zm-1 14.59l-3.29-3.3 1.41-1.41L11 13.76l4.88-4.88 1.41 1.41L11 16.59z"/></svg>;

export default function App() {
  const [tab, setTab] = useState("home");
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

  const [likes, setLikes] = useState({});
  const [follows, setFollows] = useState({});
  const [newPost, setNewPost] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);

  const agent = SPECIALISTS.find(s => s.id === currentAgent);

  useEffect(() => {
    if (tab === "coach") aiEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, thinking, tab]);

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    setChatMsgs([...chatMsgs, {id:Date.now(),text:chatMsg,from:"me",time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}]);
    setChatMsg("");
  };

  const sendAI = (text) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    setAiMessages(m => [...m, { id:Date.now(), from:"me", type:"text", text, time:now }]);
    setAiInput("");
    setThinking(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let response = "";
      let suggestSpec = null;

      if (lower.includes("com") || lower.includes("nutri") || lower.includes("aliment")) {
        response = "Te paso con nuestro especialista en Nutrición.";
        suggestSpec = "nutricion";
      } else if (lower.includes("triste") || lower.includes("ansi") || lower.includes("miedo") || lower.includes("nervio")) {
        response = "Psicología puede acompañarte con más profundidad.";
        suggestSpec = "psicologia";
      } else if (lower.includes("video") || lower.includes("entren") || lower.includes("jugada")) {
        response = "Técnica puede analizar tu video.";
        suggestSpec = "tecnica";
      } else if (lower.includes("contrato") || lower.includes("scout") || lower.includes("beca")) {
        response = "Te conecto con Carrera.";
        suggestSpec = "carrera";
      } else {
        response = "Te escucho. Cuéntame más.";
      }

      setAiMessages(m => [...m, { id:Date.now()+1, from:currentAgent, type:"text", text:response, time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) }]);
      if (suggestSpec) {
        setAiMessages(m => [...m, { id:Date.now()+2, from:currentAgent, type:"specialist-card", specialist:suggestSpec }]);
      }
      setThinking(false);
    }, 1200);
  };

  const switchAgent = (id) => {
    setCurrentAgent(id);
    setShowSpecialists(false);
    const a = SPECIALISTS.find(s => s.id === id);
    setAiMessages(m => [...m, { id:Date.now(), from:id, type:"handoff", text:a.intro, time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) }]);
  };

  const toggleLike = (postId) => setLikes(l => ({...l, [postId]: !l[postId]}));
  const toggleFollow = (userId) => setFollows(f => ({...f, [userId]: !f[userId]}));

  const createPost = () => {
    if (!newPost.trim()) return;
    // En producción: enviar a backend
    setNewPost("");
    setShowNewPost(false);
    alert("Post creado! (en producción se guardaría en la base de datos)");
  };

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@700&family=Playfair+Display:wght@700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body,#root{font-family:'Outfit',sans-serif;background:#0a0e14;color:#ECEFF4;height:100vh;overflow:hidden}
.app{max-width:100%;margin:0 auto;height:100vh;display:flex;flex-direction:column;background:#0a0e14;position:relative}
@media (min-width: 769px) {
  .app{max-width:1400px}
}

.hdr{padding:10px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.06);background:rgba(10,14,20,0.95);backdrop-filter:blur(20px);z-index:100;min-height:60px}
.logo{display:flex;align-items:center;gap:10px}
.logo-text{font-family:'Inter','SF Pro Display',-apple-system,system-ui,sans-serif;font-weight:900;font-size:20px;color:#FFFFFF;line-height:1;letter-spacing:-0.02em}
.logo-tag{font-size:8px;letter-spacing:2.5px;color:#00E676;font-weight:700;margin-top:2px;font-family:'Inter',sans-serif}
.hb{background:none;border:none;color:#8899A6;cursor:pointer;padding:6px;border-radius:10px;font-size:18px}

.mc{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch}
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

/* NEW POST MODAL */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:300;display:${showNewPost?'flex':'none'};align-items:flex-start;padding-top:60px}
.modal{background:#121820;border-radius:20px;width:90%;max-width:420px;margin:0 auto;padding:20px;border:1px solid rgba(255,255,255,0.08)}
.modal-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.modal-title{font-weight:700;font-size:18px}
.modal-close{background:none;border:none;color:#8899A6;cursor:pointer;font-size:24px;padding:4px 8px}
.modal-textarea{width:100%;background:#0a0e14;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;color:#ECEFF4;font-family:'Outfit';font-size:14px;line-height:1.5;resize:vertical;min-height:120px;outline:none}
.modal-actions{display:flex;gap:8px;margin-top:12px}
.modal-btn{flex:1;padding:10px;border-radius:10px;border:none;font-weight:700;font-size:14px;cursor:pointer;font-family:'Outfit'}
.modal-btn.pri{background:#00E676;color:#0a0e14}
.modal-btn.sec{background:rgba(255,255,255,0.05);color:#ECEFF4}

/* NAV */
.bnav{display:flex;justify-content:space-around;align-items:center;padding:6px 0 calc(6px + env(safe-area-inset-bottom));border-top:1px solid rgba(255,255,255,0.06);background:rgba(10,14,20,0.97);backdrop-filter:blur(20px);flex-shrink:0}
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
            <div className="logo">
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
            <button className="hb">🔔</button>
          </div>
        )}

        <div className="mc">
          {/* ====== HOME FEED ====== */}
          {tab === "home" && !viewPost && !viewProfile && (
            <div className="posts-grid">
              {POSTS.map(p => (
                <div key={p.id} className="post">
                  <div className="poh" onClick={() => setViewProfile(USERS.find(u=>u.id===p.userId))}>
                    <div className="poav">{p.av}</div>
                    <div className="poi">
                      <div className="pon">{p.name} {p.verified && V}</div>
                      <div className="pot">{p.time}</div>
                    </div>
                  </div>
                  <div className="poc">{p.text}</div>
                  {p.image && (
                    <div className="pov">
                      <div className="pov-label">📷 {p.image === 'game' ? 'Foto del partido' : p.image === 'training' ? 'Entrenamiento' : 'Celebración del gol'}</div>
                    </div>
                  )}
                  <div className="poa">
                    <button className={`poab lk ${(likes[p.id] || p.liked)?'on':''}`} onClick={() => toggleLike(p.id)}>
                      {(likes[p.id] || p.liked) ? '❤️' : '🤍'} {p.likes + (likes[p.id] && !p.liked ? 1 : likes[p.id]===false && p.liked ? -1 : 0)}
                    </button>
                    <button className="poab" onClick={() => setViewPost(p)}>💬 {p.comments}</button>
                    <button className="poab">🔗 Compartir</button>
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
                  <button className="poab">🔗 Compartir</button>
                </div>
                <div className="comments">
                  <div className="com-title">Comentarios</div>
                  {viewPost.commentList.map((c,i) => (
                    <div key={i} className="com-item">
                      <div className="com-av">{c.u.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
                      <div className="com-content">
                        <div className="com-name">{c.u}</div>
                        <div className="com-text">{c.t}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ====== PROFILE VIEW ====== */}
          {viewProfile && (
            <div className="profile">
              <div className="prof-av">{viewProfile.avatar}</div>
              <div className="prof-name">{viewProfile.name} {viewProfile.verified && V}</div>
              <div className="prof-meta">📍 {viewProfile.city}, {viewProfile.country} · {viewProfile.age} años · {viewProfile.position}</div>
              <div className="prof-bio">{viewProfile.bio}</div>
              <div className="prof-stats">
                <div className="prof-stat"><div className="prof-stat-v">{viewProfile.followers}</div><div className="prof-stat-l">Seguidores</div></div>
                <div className="prof-stat"><div className="prof-stat-v">{viewProfile.following}</div><div className="prof-stat-l">Siguiendo</div></div>
                <div className="prof-stat"><div className="prof-stat-v">{POSTS.filter(p=>p.userId===viewProfile.id).length}</div><div className="prof-stat-l">Posts</div></div>
              </div>
              <button className={`prof-btn ${follows[viewProfile.id]?'sec':'pri'}`} onClick={() => toggleFollow(viewProfile.id)}>
                {follows[viewProfile.id] ? 'Siguiendo ✓' : '+ Seguir'}
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
              <div className="prof-av">TU</div>
              <div className="prof-name">Tu nombre</div>
              <div className="prof-meta">Completa tu perfil para conectar con la comunidad</div>
              <div className="prof-stats">
                <div className="prof-stat"><div className="prof-stat-v">{CURRENT_USER.followers}</div><div className="prof-stat-l">Seguidores</div></div>
                <div className="prof-stat"><div className="prof-stat-v">{CURRENT_USER.following}</div><div className="prof-stat-l">Siguiendo</div></div>
                <div className="prof-stat"><div className="prof-stat-v">0</div><div className="prof-stat-l">Posts</div></div>
              </div>
              <button className="prof-btn pri">Editar perfil</button>
              <button className="prof-btn sec">⚙️ Configuración</button>
            </div>
          )}
        </div>

        {/* FLOATING ACTION BUTTON */}
        {tab === "home" && !viewPost && !viewProfile && (
          <button className="fab" onClick={() => setShowNewPost(true)}>+</button>
        )}

        {/* NEW POST MODAL */}
        <div className="modal-bg" onClick={() => setShowNewPost(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div className="modal-title">Nuevo post</div>
              <button className="modal-close" onClick={() => setShowNewPost(false)}>×</button>
            </div>
            <textarea className="modal-textarea" placeholder="¿Qué está pasando?" value={newPost} onChange={e => setNewPost(e.target.value)}/>
            <div className="modal-actions">
              <button className="modal-btn sec">📷 Foto</button>
              <button className="modal-btn sec">🎥 Video</button>
              <button className="modal-btn pri" onClick={createPost}>Publicar</button>
            </div>
          </div>
        </div>

        {/* BOTTOM NAV */}
        {!chatOpen && (
          <nav className="bnav">
            <button className={`ni ${tab==='home'?'on':''}`} onClick={()=>{setTab('home');setViewPost(null);setViewProfile(null);}}><span className="ni-emoji">🏠</span><span>Inicio</span></button>
            <button className={`ni ${tab==='coach'?'on':''}`} onClick={()=>setTab('coach')}><span className="ni-emoji">⚽</span><span>Coach</span></button>
            <button className={`ni ${tab==='chat'?'on':''}`} onClick={()=>{setTab('chat');setChatOpen(null);}}><span className="ni-emoji">💬</span><span>Chat</span>{CHATS.reduce((s,c)=>s+c.unread,0)>0 && <span className="nbg">{CHATS.reduce((s,c)=>s+c.unread,0)}</span>}</button>
            <button className={`ni ${tab==='profile'?'on':''}`} onClick={()=>{setTab('profile');setViewPost(null);setViewProfile(null);}}><span className="ni-emoji">👤</span><span>Perfil</span></button>
          </nav>
        )}
      </div>
    </>
  );
}
