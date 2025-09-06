// Retro Gaming Timeline interactivity
document.addEventListener('DOMContentLoaded', () => {
  // Timeline data
  const timelineData = [
    {
      phase: 1,
      title: "IDEATION",
      skills: ["Business analysis", "Market analysis", "Product Research"],
      tools: ["Miro", "Figma", "Google Analytics", "SEMrush", "SurveyMonkey"]
    },
    {
      phase: 2,
      title: "DOCUMENTATION",
      skills: ["Business Model", "Game Design Document", "Software Requirement Specification"],
      tools: ["Notion", "Confluence", "Microsoft Word", "Google Docs", "Lucidchart"]
    },
    {
      phase: 3,
      title: "MANAGEMENT",
      skills: ["Project Management", "Product Development", "Business Development Management"],
      tools: ["Jira", "Trello", "Asana", "Slack", "Microsoft Teams"]
    },
    {
      phase: 4,
      title: "DEVELOPMENT",
      skills: ["Unity", "Python", "Web dev", "Java", "LLM Server"],
      tools: ["Visual Studio Code", "Git/GitHub", "Docker", "AWS", "Postman", "Unity Editor"]
    },
    {
      phase: 5,
      title: "TEST & REVIEW",
      skills: ["Quality Assurance Test"],
      tools: ["Selenium", "Jest", "Cypress", "Jira", "TestRail"]
    }
  ];

  // DOM elements
  const timeline = document.getElementById('timeline');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  let currentPhase = null; // Start with no active phase
  const totalPhases = timelineData.length;

  // Generate timeline items
  function generateTimeline() {
    timeline.innerHTML = '';

    timelineData.forEach(item => {
      const timelineItem = document.createElement('div');
      timelineItem.className = 'timeline-item';
      timelineItem.dataset.phase = item.phase;

      if (item.phase === currentPhase) {
        timelineItem.classList.add('active');
      }

      timelineItem.innerHTML = `
        <div class="timeline-bubble" tabindex="0" role="button" aria-label="View details for ${item.title}" aria-expanded="${item.phase === currentPhase}">
          <div class="bubble-title">${item.title}</div>
          <div class="bubble-content">
            <div class="content-section">
              <h4>SKILLS</h4>
              <ul class="skills-list">
                ${item.skills.map(skill => `<li>${skill}</li>`).join('')}
              </ul>
            </div>
            <div class="content-section">
              <h4>TOOLS</h4>
              <ul class="tools-list">
                ${item.tools.map(tool => `<li>${tool}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      `;

      timeline.appendChild(timelineItem);
    });

    // Add event listeners
    document.querySelectorAll('.timeline-bubble').forEach(element => {
      element.addEventListener('click', function() {
        const phase = parseInt(this.closest('.timeline-item').dataset.phase);
        const isCurrentlyActive = this.closest('.timeline-item').classList.contains('active');

        if (isCurrentlyActive) {
          // If already active, collapse it by setting no active phase
          setActivePhase(null);
        } else {
          // If not active, make it active
          setActivePhase(phase);
        }
      });

      element.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const phase = parseInt(this.closest('.timeline-item').dataset.phase);
          const isCurrentlyActive = this.closest('.timeline-item').classList.contains('active');

          if (isCurrentlyActive) {
            // If already active, collapse it by setting no active phase
            setActivePhase(null);
          } else {
            // If not active, make it active
            setActivePhase(phase);
          }
        }
      });
    });
  }

  // Set active phase
  function setActivePhase(phase) {
    currentPhase = phase;

    // Update active state
    document.querySelectorAll('.timeline-item').forEach(item => {
      if (phase === null) {
        // Collapse all phases
        item.classList.remove('active');
        item.querySelector('.timeline-bubble').setAttribute('aria-expanded', 'false');
      } else if (parseInt(item.dataset.phase) === phase) {
        item.classList.add('active');
        item.querySelector('.timeline-bubble').setAttribute('aria-expanded', 'true');
      } else {
        item.classList.remove('active');
        item.querySelector('.timeline-bubble').setAttribute('aria-expanded', 'false');
      }
    });

    // Update button states
    prevBtn.disabled = phase === null || phase === 1;
    nextBtn.disabled = phase === null || phase === totalPhases;
  }

  // Button event listeners
  prevBtn.addEventListener('click', () => {
    if (currentPhase === null) {
      setActivePhase(totalPhases); // If collapsed, go to last phase
    } else if (currentPhase > 1) {
      setActivePhase(currentPhase - 1);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentPhase === null) {
      setActivePhase(1); // If collapsed, go to first phase
    } else if (currentPhase < totalPhases) {
      setActivePhase(currentPhase + 1);
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      if (currentPhase === null) {
        setActivePhase(totalPhases); // If collapsed, go to last phase
      } else if (currentPhase > 1) {
        setActivePhase(currentPhase - 1);
      }
    } else if (e.key === 'ArrowRight') {
      if (currentPhase === null) {
        setActivePhase(1); // If collapsed, go to first phase
      } else if (currentPhase < totalPhases) {
        setActivePhase(currentPhase + 1);
      }
    }
  });

  // Initialize timeline
  generateTimeline();
  setActivePhase(null); // Start with all phases collapsed
});
