export default function Logo({ size = 32 }) {
  return (
    <img
      src="https://fsntjslzgbewxeaoqobj.supabase.co/storage/v1/object/public/Avatars/mirafut-horizontal-transparente.png"
      alt="MiraFut"
      style={{ height: size * 1.5, width: 'auto', objectFit: 'contain' }}
    />
  );
}
