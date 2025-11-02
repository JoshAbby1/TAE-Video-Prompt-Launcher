const photoInput = document.getElementById('photo');
const preview = document.getElementById('preview');
const categorySel = document.getElementById('category');
const generateBtn = document.getElementById('generate');
const ideasDiv = document.getElementById('ideas');
const chosen = document.getElementById('chosen');
const copyBtn = document.getElementById('copy');

// Local-only image preview (no uploads)
photoInput.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return (preview.innerHTML = '');
  const img = document.createElement('img');
  img.src = URL.createObjectURL(file);
  img.onload = () => URL.revokeObjectURL(img.src);
  preview.innerHTML = '';
  preview.appendChild(img);
});

// Optional add-ons
const NEGATIVE = "Negative prompt: cartoonish, overexposed, HDR, blurry, plastic skin, extra limbs, distorted faces.";
const RAW = "RAW photo, photorealistic, natural skin texture, ultra-detailed,";

// Templates
const TEMPLATES = {
  portrait: [
    "[RAW] Ultra-realistic shoulders-up portrait of [your character] on a clean white backdrop, neutral studio lighting, Canon 85mm f/1.4, crisp eyes, micro-contrast, subtle film grain.",
    "[RAW] Candid outdoor head-and-shoulders of [your character] at golden hour, soft rim light, shallow depth, 50mm f/1.8, natural color grade, handheld realism.",
    "[RAW] Moody indoor portrait of [your character] by a window, soft side key, catchlights visible, 35mm f/2, fine skin texture, editorial vibe."
  ],
  couple: [
    "[RAW] Natural couple photo: [your character] and partner walking side-by-side, soft overcast light, 50mm f/2, genuine smiles, motion blur in background, street depth.",
    "[RAW] Cozy indoor couple moment on a sofa, warm tungsten lamps, 35mm f/1.8, layered textures, candid laughter, lifestyle editorial.",
    "[RAW] Sunset silhouette kiss on a rooftop, 85mm f/2, flare, city bokeh, romantic cinematic framing."
  ],
  pet: [
    "[RAW] [your character] holding a black Cane Corso puppy at chest level, 50mm f/1.8, soft daylight, detailed fur texture, gentle expression, lifestyle realism.",
    "[RAW] Playful pet portrait: Dachshund on lap, nose-in-focus look to camera, 35mm f/2, indoor daylight, cozy blankets, candid feel.",
    "[RAW] Action shot in a park: [your character] running with dog, 70-200mm tele, frozen motion, crisp fur detail, natural greens."
  ],
  fashion: [
    "[RAW] Full-body street fashion shot of [your character] wearing a clean tracksuit + trainers, urban alley, diffused light, 35mm f/2, editorial stance, subtle grain.",
    "[RAW] Studio lookbook: corset + ripped denim on [your character], color backdrop, clamshell lighting, 50mm f/4, sharp fabric detail, minimal shadows.",
    "[RAW] Pretty-grunge outfit: slip dress + chunky boots, neon edge light, 28mm f/2, reflective puddles, high-contrast city vibe."
  ],
  fitness: [
    "[RAW] Gym scene: [your character] mid-rep with dumbbells, hard side key, sweat highlights, 35mm f/1.8, gritty texture, documentary style.",
    "[RAW] Outdoor sprint start pose, track lanes leading lines, 50mm f/2, morning light haze, dynamic tension, crisp muscles.",
    "[RAW] Calisthenics park bars, low angle hero shot of [your character], 24mm f/2.8, dramatic sky, sharp detail."
  ],
  product: [
    "[RAW] Desktop product flatlay with hands: fragrance bottle + props, softbox top light, 50mm macro, matte textures, subtle shadows, lifestyle taste.",
    "[RAW] Apparel on body: close crop of hoodie texture on [your character], side key, 85mm f/2.8, fabric weave detail, clean color balance.",
    "[RAW] Sneaker on reflective surface, low angle, 35mm f/4, controlled highlights, premium feel."
  ],
  horror: [
    "[RAW] Cinematic horror still: [your character] seated center, surrounding shadows imply figures off-frame, single practical lamp, 35mm f/1.8, tense atmosphere.",
    "[RAW] Rainy alley close-up of [your character] glancing back, harsh backlight haze, 50mm f/2, water droplets, gritty grain.",
    "[RAW] Abandoned farmhouse corridor, flashlight cone lighting on [your character], 24mm f/2.8, dust motes, eerie realism."
  ],
  winter: [
    "[RAW] Ultra-realistic outdoor snow portrait of [your character] in leopard print two-piece + fluffy cream hat + boots, golden-hour snow glow, 50mm f/2, candid laugh by a cheeky snowman with a cigarette.",
    "[RAW] Street snow scene: [your character] in North Face puffer + tracksuit bottoms, visible breath, 35mm f/2, reflective ice, cinematic blue tones.",
    "[RAW] Cozy indoors by frosted window, knitwear + steam mug, 85mm f/2, soft side light, real condensation detail."
  ],
  street: [
    "[RAW] Urban candid of [your character] crossing zebra lines in Soho, 35mm f/2, motion blur trails, shop neons, editorial street energy.",
    "[RAW] Graffiti alley portrait, low angle, 28mm f/2, strong perspective lines, crunchy texture, handheld realism.",
    "[RAW] Night market bokeh: [your character] looking off-camera, 50mm f/1.8, colorful lights, shallow DOF, authentic vibe."
  ],
};

function expand(raw, useRaw, useNeg){
  let p = raw.replace("[RAW]", useRaw ? RAW : "").trim().replace(/\s+/g," ").replace(/\s,/, ",");
  if(useNeg){ p += " " + NEGATIVE; }
  return p;
}

document.getElementById('generate').addEventListener('click', () => {
  const cat = categorySel.value;
  if(!cat){ ideasDiv.innerHTML = '<p class="muted">Pick a category first.</p>'; return; }
  const useRaw = document.getElementById('raw').checked;
  const useNeg = document.getElementById('neg').checked;
  const arr = TEMPLATES[cat] || [];
  ideasDiv.innerHTML = '';
  arr.forEach((tpl) => {
    const idea = document.createElement('div');
    idea.className = 'idea';
    const text = expand(tpl, useRaw, useNeg);
    idea.textContent = text;
    idea.title = "Click to select";
    idea.addEventListener('click', () => { chosen.value = text; window.scrollTo({top:document.body.scrollHeight, behavior:'smooth'}); });
    ideasDiv.appendChild(idea);
  });
});

copyBtn.addEventListener('click', async () => {
  if(!chosen.value.trim()) return;
  try{
    await navigator.clipboard.writeText(chosen.value);
    copyBtn.textContent = "Copied ✔";
    setTimeout(()=> copyBtn.textContent="Copy to clipboard", 1200);
  }catch(e){
    copyBtn.textContent = "Copy failed";
    setTimeout(()=> copyBtn.textContent="Copy to clipboard", 1200);
  }
});
