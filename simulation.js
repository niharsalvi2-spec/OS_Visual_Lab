document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const p1 = document.getElementById('process-1');
    const p2 = document.getElementById('process-2');
    const speechP1 = document.getElementById('speech-p1');
    const speechP2 = document.getElementById('speech-p2');
    const sharedBox = document.getElementById('shared-box');
    const balanceVal = document.getElementById('balance-val');
    const lockIcon = document.getElementById('mutex-lock');
    const waitQueue = document.getElementById('wait-queue');
    const logBox = document.getElementById('sim-log');

    // Buttons
    const btnRace = document.getElementById('btn-race');
    const btnMutex = document.getElementById('btn-mutex');
    const btnReset = document.getElementById('btn-reset');

    let isAnimating = false;

    // Default Positions
    const resetSim = () => {
        if (isAnimating) {
            gsap.killTweensOf("*");
        }
        isAnimating = false;
        
        // Reset dom
        gsap.set(p1, { x: 0, y: 0, opacity: 1 });
        gsap.set(p2, { x: 0, y: 0, opacity: 1 });
        gsap.set(speechP1, { opacity: 0 });
        gsap.set(speechP2, { opacity: 0 });
        
        lockIcon.classList.add('hidden');
        lockIcon.innerText = '🔓';
        
        sharedBox.style.backgroundColor = 'rgba(0, 240, 255, 0.1)';
        sharedBox.style.borderColor = 'var(--accent-blue)';
        balanceVal.innerText = '$100';
        balanceVal.style.color = '#fff';
        
        logBox.innerHTML = 'Simulation reset. Ready.';
        
        btnRace.disabled = false;
        btnMutex.disabled = false;
    };

    btnReset.addEventListener('click', resetSim);

    // Helpers
    const showSpeech = (el, text, duration = 1.5) => {
        el.innerText = text;
        return gsap.to(el, { opacity: 1, y: -10, duration: 0.3, yoyo: true, hold: duration });
    };

    const updateLog = (msg, append = false) => {
        if(append) logBox.innerHTML += `<br>> ${msg}`;
        else logBox.innerHTML = `> ${msg}`;
    };

    // 1. Race Condition
    btnRace.addEventListener('click', () => {
        if (isAnimating) return;
        isAnimating = true;
        btnRace.disabled = true;
        btnMutex.disabled = true;
        updateLog("Starting Race Condition simulation...");

        const tl = gsap.timeline({ onComplete: () => { isAnimating = false; }});

        // Both processes move to the center simultaneously
        tl.to(p1, { x: 300, duration: 1, ease: "power2.inOut" }, "start")
          .to(p2, { x: -300, duration: 1, ease: "power2.inOut" }, "start")
          .call(() => updateLog("P1 and P2 attempt to read the balance ($100) at the exact same time.", true))
          
        // Show speech "Read $100"
          .to(speechP1, { opacity: 1, text: "Read $100", duration: 0.2 }, "read")
          .to(speechP2, { opacity: 1, text: "Read $100", duration: 0.2 }, "read")
          .to({}, { duration: 1 }) // wait
          
        // Calc phase
          .call(() => updateLog("Calculations happen simultaneously...", true))
          .to(speechP1, { text: "Calc 100+50=150", duration: 0.2 }, "calc")
          .to(speechP2, { text: "Calc 100-20=80", duration: 0.2 }, "calc")
          .to({}, { duration: 1 })

        // Write phase (RACE CONDITION)
          .call(() => updateLog("Race! P1 writes $150.", true))
          .call(() => { balanceVal.innerText = "$150"; balanceVal.style.color = "#ff9900"; })
          .to({}, { duration: 0.5 })
          .call(() => updateLog("Immediately, P2 overwrites it with $80! Deposit lost!", true))
          .call(() => { balanceVal.innerText = "$80"; balanceVal.style.color = "#cc00ff"; })
          .to(sharedBox, { backgroundColor: 'rgba(255, 51, 102, 0.4)', borderColor: 'var(--danger)', duration: 0.3 })
          
        // Retreat
          .to([speechP1, speechP2], { opacity: 0, duration: 0.3 })
          .to(p1, { x: 0, duration: 1 }, "end")
          .to(p2, { x: 0, duration: 1 }, "end")
          .call(() => updateLog("Result: CORRUPTED DATA. Final balance is $80.", true));
    });

    // 2. Mutex Lock
    btnMutex.addEventListener('click', () => {
        if (isAnimating) return;
        isAnimating = true;
        btnRace.disabled = true;
        btnMutex.disabled = true;
        updateLog("Starting Mutex Lock simulation...");

        // Make lock visible
        lockIcon.classList.remove('hidden');

        const tl = gsap.timeline({ onComplete: () => { isAnimating = false; }});

        // P1 starts moving first to mimic acquiring lock
        tl.to(p1, { x: 300, duration: 1, ease: "power2.inOut" })
          .call(() => {
              lockIcon.innerText = '🔏';
              updateLog("P1 acquired the Mutex Lock.", true);
          })
          
        // P2 tries to move but finds it locked
          .to(p2, { x: -100, duration: 0.5 }, "p2_try")
          .to(p2, { x: -80, duration: 0.2, yoyo: true, repeat: 1 }, "p2_try+=0.5")
          .call(() => updateLog("P2 attempts to access, but hits the Lock barrier.", true))
          
        // Move P2 to Wait Queue
          .to(p2, { x: 50, y: 150, duration: 1, ease: "power1.inOut" }, "queue")
          .call(() => updateLog("OS Kernel moves P2 to the Waiting Queue.", true))

        // P1 does its work safely
          .to(speechP1, { opacity: 1, text: "Read $100", duration: 0.2 })
          .to({}, { duration: 0.5 })
          .to(speechP1, { text: "Calc 100+50=150", duration: 0.2 })
          .to({}, { duration: 0.5 })
          .call(() => { balanceVal.innerText = "$150"; balanceVal.style.color = "#ff9900"; })
          .call(() => updateLog("P1 safely writes $150.", true))
          .to({}, { duration: 0.5 })
          .to(speechP1, { opacity: 0, duration: 0.2 })
          .to(p1, { x: 0, duration: 1 })
          
        // P1 releases lock
          .call(() => {
              lockIcon.innerText = '🔓';
              updateLog("P1 releases the Lock. OS Kernel wakes P2.", true);
          })
          
        // Wake P2 up from queue
          .to(p2, { x: -300, y: 0, duration: 1, ease: "power2.inOut" })
          .call(() => {
              lockIcon.innerText = '🔏';
              updateLog("P2 acquired the Mutex Lock.", true);
          })
          
        // P2 does its work securely
          .to(speechP2, { opacity: 1, text: "Read $150", duration: 0.2 })
          .to({}, { duration: 0.5 })
          .to(speechP2, { text: "Calc 150-20=130", duration: 0.2 })
          .to({}, { duration: 0.5 })
          .call(() => { balanceVal.innerText = "$130"; balanceVal.style.color = "#00ff9d"; })
          .call(() => updateLog("P2 safely writes $130.", true))
          .to({}, { duration: 0.5 })
          .to(speechP2, { opacity: 0 })
          .to(p2, { x: 0, duration: 1 })
          
        // Simulation success
          .call(() => {
              lockIcon.innerText = '🔓';
              sharedBox.style.backgroundColor = 'rgba(0, 255, 157, 0.2)';
              sharedBox.style.borderColor = 'var(--success)';
              updateLog("Result: SYNCHRONIZATION SUCCESS. Final balance is $130.", true);
          });
    });

    // Tab Switching Logic
    const modeBtns = document.querySelectorAll('.mode-btn');
    const modeSections = document.querySelectorAll('.mode-section');

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all buttons & sections
            modeBtns.forEach(b => b.classList.remove('active'));
            modeSections.forEach(s => s.classList.remove('active'));

            // Add active to clicked button & target section
            btn.classList.add('active');
            const targetId = `mode-${btn.dataset.mode}`;
            document.getElementById(targetId).classList.add('active');
        });
    });
});

