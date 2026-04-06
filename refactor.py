import re

with open('c:/Users/nihar/OneDrive/Desktop/os_mini/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# The content to insert after Concept Introduction:
mode_selector = """        </section>

        <!-- MODE SELECTOR -->
        <nav class="mode-selector">
            <button class="mode-btn active" data-mode="visual">Visual Mode 🎨</button>
            <button class="mode-btn" data-mode="cpu">CPU Mode ⚙️</button>
            <button class="mode-btn" data-mode="code">Code Mode 💻</button>
        </nav>

        <div id="mode-visual" class="mode-section active">"""

html = html.replace('        </section>\n\n        <!-- REAL LIFE ANALOGY -->', mode_selector + '\n        <!-- REAL LIFE ANALOGY -->')

# Now add closing div for visual mode, and start CPU mode before HARDWARE TOOLS
cpu_start = """        </section>
        
        <!-- VISUAL DIAGRAM -->
        <section class="glass-card diagram-section">
            <h2>4. Visual Diagram: OS Flow</h2>
            <p>A flowchart representation of how Process P1 and P2 interact with the Critical Section via OS Kernel.</p>
            <div class="mermaid-container">
                <div class="mermaid">
                    graph TD
                        style CriticalSection fill:#ffcccc,stroke:#ff0000,stroke-width:2px,color:#000
                        style Lock fill:#ffd700,stroke:#d4af37,stroke-width:4px,color:#000

                        subgraph Memory Zone
                            Lock((Mutex Lock 🔏))
                            CriticalSection[Critical Section<br>Shared Memory]
                        end

                        subgraph OS Kernel
                            WQ[Waiting Queue]
                            Scheduler{CPU Scheduler}
                        end

                        P1[Process P1] -->|1. Test & Set Instruction| Lock
                        Lock -->|2. Lock Acquired!| CriticalSection
                        P2[Process P2] -->|3. Tries to acquire| Lock
                        Lock -.->|4. DENIED: Already Locked| P2
                        P2 -.->|5. Kernel moves to Wait| WQ
                        CriticalSection -->|6. P1 Releases Lock| Lock
                        Lock -->|7. Kernel Interrupt| WQ
                        WQ -->|8. Push back to CPU| Scheduler
                        Scheduler -->|9. P2 Enters safely| CriticalSection
                </div>
            </div>
        </section>
        </div>

        <div id="mode-cpu" class="mode-section">"""

# Replace HW Tools starting comment
html = html.replace('        <!-- HARDWARE TOOLS -->', cpu_start + '\n        <!-- HARDWARE TOOLS -->')

# Modify the headings inside Hardware mode and CPU mode
html = html.replace('<h2>4. Hardware Tools for the Critical Section</h2>', '<h2>1. Hardware Tools for the Critical Section</h2>')
html = html.replace('<h2>5. CPU Mode: Real Computer Working</h2>', '<h2>2. CPU Mode: Real Computer Working</h2>')

# Now close CPU mode and start Code mode
code_start = """        </section>
        </div>

        <div id="mode-code" class="mode-section">"""
html = html.replace('        <!-- CODE SECTION -->', code_start + '\n        <!-- CODE SECTION -->')
html = html.replace('<h2>6. Code Mode: OS Implementation</h2>', '<h2>1. Code Mode: OS Implementation</h2>')

# Remove the old VISUAL DIAGRAM section
old_diagram = re.search(r'        <!-- VISUAL DIAGRAM -->.*?</div>\s*</section>', html, flags=re.DOTALL)
if old_diagram:
    html = html.replace(old_diagram.group(0), '')

# Close the Code mode div before KEY INSIGHT
html = html.replace('        <!-- KEY INSIGHT -->', '        </div>\n\n        <!-- KEY INSIGHT -->')
html = html.replace('<h2>8. Key Insight</h2>', '<h2>Key Insight</h2>')

with open('c:/Users/nihar/OneDrive/Desktop/os_mini/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Done index.html rewrite.")
