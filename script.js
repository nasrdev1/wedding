(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ================= lock scroll until envelope opens ================= */
  document.body.classList.add("locked");

  /* ================= sparkle field ================= */
  function buildSparkles(){
    const field = document.getElementById("sparkleField");
    if (!field || prefersReducedMotion) return;
    const count = window.innerWidth < 600 ? 22 : 40;
    for (let i = 0; i < count; i++){
      const s = document.createElement("span");
      s.className = "spark";
      const size = 2 + Math.random() * 3;
      s.style.width = s.style.height = `${size}px`;
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.animationDuration = `${5 + Math.random() * 7}s`;
      s.style.animationDelay = `${Math.random() * 8}s`;
      field.appendChild(s);
    }
  }
  buildSparkles();

  /* ================= envelope open interaction ================= */
  const scene = document.getElementById("envelopeScene");
  const btn = document.getElementById("envelopeBtn");
  const tapHint = document.getElementById("tapHint");
  const heroLines = gsap.utils.toArray(".reveal-line");

  gsap.set(heroLines, { opacity: 0, y: 26 });

  let opened = false;

  function openEnvelope(){
    if (opened) return;
    opened = true;
    tapHint.style.opacity = "0";
    scene.classList.add("opening");

    // after flap + letter animation, dismiss the whole scene
    window.setTimeout(() => {
      scene.classList.add("leaving");
      document.body.classList.remove("locked");
      window.setTimeout(() => {
        scene.classList.add("hidden");
        revealHero();
      }, 1050);
    }, 1500);
  }

  function revealHero(){
    if (prefersReducedMotion){
      gsap.set(heroLines, { opacity: 1, y: 0 });
      return;
    }
    gsap.to(heroLines, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: "power3.out",
      stagger: 0.28
    });
  }

  btn.addEventListener("click", openEnvelope);
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " "){ e.preventDefault(); openEnvelope(); }
  });

  /* ================= scroll-triggered reveals ================= */
  if (window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);

    const scrollFadeTargets = [
      ".section-head", ".countdown-grid", ".date-card",
      ".venue-address", ".map-frame", ".btn-solid",
      ".footer-doves", ".footer-line", ".footer-names"
    ];

    scrollFadeTargets.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        gsap.fromTo(el,
          { opacity: 0, y: 34 },
          {
            opacity: 1, y: 0, duration: 1, ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    });

    document.querySelectorAll(".count-card").forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, y: 24, scale: .92 },
        {
          opacity: 1, y: 0, scale: 1, duration: .7, delay: i * .08, ease: "back.out(1.6)",
          scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none reverse" }
        }
      );
    });
  }

  /* ================= countdown timer ================= */
  const target = new Date("2026-08-04T17:30:00+01:00"); // Tunisia (UTC+1, no DST)

  const elD = document.getElementById("cdDays");
  const elH = document.getElementById("cdHours");
  const elM = document.getElementById("cdMinutes");
  const elS = document.getElementById("cdSeconds");

  function pad(n){ return String(n).padStart(2, "0"); }

  function tickCountdown(){
    const now = new Date();
    let diff = target - now;
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    if (elD) elD.textContent = pad(days);
    if (elH) elH.textContent = pad(hours);
    if (elM) elM.textContent = pad(mins);
    if (elS) elS.textContent = pad(secs);
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ================= add to calendar (.ics download) ================= */
  const addCalBtn = document.getElementById("addCalendarBtn");
  if (addCalBtn){
    addCalBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Wael & Mariem Wedding//AR",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        "UID:" + Date.now() + "@wael-mariem-wedding",
        "DTSTAMP:" + icsUTC(new Date()),
        "DTSTART:20260804T203000Z",
        "DTEND:20260805T003000Z",
        "SUMMARY:حفل زفاف وائل ومريم",
        "DESCRIPTION:يسعدنا حضوركم حفل زفاف وائل ومريم.",
        "LOCATION:Salle des Fêtes Municipale\\, 6 Bd de l'Armée Nationale\\, Sfax 3000",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Wael-Mariem-Wedding.ics";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  function icsUTC(d){
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }

})();
