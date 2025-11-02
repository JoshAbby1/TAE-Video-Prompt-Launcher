const photoInput   = document.getElementById('photo');
const uploadStatus = document.getElementById('uploadStatus');
const categorySel  = document.getElementById('category');
const vibeSel      = document.getElementById('vibe');
const generateBtn  = document.getElementById('generate');
const ideasDiv     = document.getElementById('ideas');
const chosen       = document.getElementById('chosen');
const copyBtn      = document.getElementById('copy');

/* 1) Local-only image handling (no preview) */
photoInput.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) {
    uploadStatus.textContent = "No photo selected";
    uploadStatus.style.color = "";
    return;
  }
  uploadStatus.textContent = "Photo ready ✓ (local only)";
  uploadStatus.style.color = "#9FE870";
});

/* 2) Prompt helpers */
const NEGATIVE = "Negative prompt: cartoonish, overexposed, HDR, blurry, plastic skin, extra limbs, distorted faces.";
const RAW = "RAW photo, photorealistic, natural skin texture, ultra-detailed,";

// Vibe → descriptor line appended to the prompt
const VIBES = {
  cute:    "Mood: cute video — playful energy, soft lighting, gentle pacing, sweet moments.",
  chaotic: "Mood: chaotic video — high energy, quick cuts, handheld feel, fun zooms and whip pans.",
  calm:    "Mood: calm video — minimal movement, slow pans/dollies, soft ambient audio.",
  random:  "Mood: random video — spontaneous, quirky surprises, unexpected actions, candid beats.",
  funny:   "Mood: funny video — cheeky timing, light mischief, punchline at the end."
};

// Category prompt templates
const TEMPLATES = {
  portrait: [
    "[RAW] Shoulders-up of [your character] on a clean white backdrop, neutral studio lighting, Canon 85mm f/1.4, crisp eyes, micro-contrast, subtle film grain. Short 6–10s clip, natural idle motion.",
    "[RAW] Outdoor head-and-shoulders of [your character] at golden hour, soft rim light, shallow DOF, 50mm f/1.8, handheld realism. 6–10s clip, tiny head turns and eye flicks.",
    "[RAW] Window light portrait of [your character], soft side key, 35mm f/2, fine skin texture, editorial vibe. 6–10s clip, gentle breathing and micro-expressions."
  ],
  couple: [
    "[RAW] [your character] and partner walking side-by-side, overcast light, 50mm f/2, motion in background, lifestyle candid. 6–10s clip, natural walk-by and glance.",
    "[RAW] Cozy sofa moment, warm tungsten lamps, 35mm f/1.8, layered textures, candid laughter. 6–10s clip, subtle lean-in and giggle.",
    "[RAW] Rooftop sunset silhouette, 85mm f/2, flare, city bokeh, romantic framing. 6–10s clip, gentle sway and kiss."
  ],
  pet: [
    "[RAW] [your character] holding a black Cane Corso puppy at chest level, soft daylight, 50mm f/1.8, detailed fur. 6–10s clip, tiny paw movement and nose sniff.",
    "[RAW] Dachshund on lap, nose-in-focus, 35mm f/2, cozy indoor daylight. 6–10s clip, small ear flicks and blink.",
    "[RAW] Park action setup, 70–200mm, crisp fur, natural greens. 6–10s clip, playful step forward."
  ],
  fashion: [
    "[RAW] Full-body street fashion of [your character] in clean tracksuit + trainers, 35mm f/2, diffused alley light, editorial stance. 6–10s clip, slow look-to-camera.",
    "[RAW] Studio lookbook: corset + ripped denim, color backdrop, clamshell lighting, 50mm f/4, sharp fabric detail. 6–10s clip, subtle weight shift.",
    "[RAW] Pretty-grunge: slip dress + chunky boots, neon edge light, 28mm f/2, reflective puddles. 6–10s clip, hair/sleeve micro-movement."
  ],
  fitness: [
    "[RAW] Gym scene: mid-rep dumbbells, hard side key, 35mm f/1.8, gritty texture. 6–10s clip, brief curl motion or breath-up.",
    "[RAW] Track sprint start, 50mm f/2, morning haze, dynamic tension. 6–10s clip, lean in then relax.",
    "[RAW] Calisthenics bars, 24mm f/2.8, dramatic sky. 6–10s clip, small pull-up motion (begin–hold)."
  ],
  product: [
    "[RAW] Desktop flatlay with hands: fragrance bottle + props, softbox top light, 50mm macro, matte textures. 6–10s clip, gentle hand rotate.",
    "[RAW] Hoodie texture close crop on [your character], side key, 85mm f/2.8, fabric weave detail. 6–10s clip, sleeve pinch.",
    "[RAW] Sneaker on reflective surface, low angle, 35mm f/4, controlled highlights. 6–10s clip, slow camera creep."
  ],
  horror: [
    "[RAW] Cinematic horror still: [your character] seated center, figures implied off-frame, single lamp, 35mm f/1.8, tense atmosphere. 6–10s clip, tiny glance.",
    "[RAW] Rainy alley close-up, harsh backlight, 50mm f/2, droplets. 6–10s clip, slow breath exhale mist.",
    "[RAW] Abandoned corridor, flashlight cone, 24mm f/2.8, dust motes. 6–10s clip, beam sweep."
  ],
  winter: [
    "[RAW] Snow portrait of [your character] in leopard two-piece + fluffy cream hat + boots, golden-hour snow glow, 50mm f/2. 6–10s clip, playful shiver.",
    "[RAW] Street snow scene: North Face puffer + tracksuit bottoms, visible breath, 35mm f/2, blue tones. 6–10s clip, breath cloud.",
    "[RAW] Frosted window indoors, knitwear + steam mug, 85mm f/2, side light. 6–10s clip, slow mug lift."
  ],
  street: [
    "[RAW] Crossing zebra lines in Soho, 35mm f/2, motion trails, neon shops. 6–10s clip, slow cross then glance.",
    "[RAW] Graffiti alley low angle, 28mm f/2, strong perspective lines, handheld. 6–10s clip, slight step forward.",
    "[RAW] Night market bokeh, 50mm f/1.8, colorful lights, shallow DOF. 6–10s clip, look away then to lens."
  ],
};

function expand(raw, useRaw, useNeg, vibeKey){
  let p = raw.replace("[RAW]", useRaw ? RAW : "").trim().replace(/\s+/g," ").replace(/\s,/, ",");
  if (vibeKey && VIBES[vibeKey]) p += " " + VIBES[vibeKey];
  if (useNeg) p += " " + NEGATIVE;
  return p;
}

/* 3) Generate ideas */
generateBtn.addEventListener('click', () => {
  const cat = categorySel.value;
  const vibeKey = vibeSel.value;
  ideasDiv.innerHTML = '';

  if(!cat){
    ideasDiv.innerHTML = '<p class="muted">Pick a category first.</p>';
    return;
  }
  if(!vibeKey){
    ideasDiv.innerHTML = '<p class="muted">Pick a video vibe.</p>';
    return;
  }

  const useRaw = document.getElementById('raw').checked;
  const useNeg = document.getElementById('neg').checked;
  const arr = TEMPLATES[cat] || [];

  arr.forEach((tpl) => {
    const idea = document.createElement('div');
    idea.className = 'idea';
    const text = expand(tpl, useRaw, useNeg, vibeKey);
    idea.textContent = text;
    idea.title = "Click to select";
    idea.addEventListener('click', () => {
      chosen.value = text;
      window.scrollTo({top:document.body.scrollHeight, behavior:'smooth'});
    });
    ideasDiv.appendChild(idea);
  });
});

/* 4) Copy */
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
