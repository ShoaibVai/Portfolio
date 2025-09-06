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
      // Click/Tap toggle functionality (works for both desktop and mobile)
      element.addEventListener('click', function(e) {
        e.preventDefault();
        const phase = parseInt(this.closest('.timeline-item').dataset.phase);

        // If this phase is currently active, deactivate it
        if (currentPhase === phase) {
          setActivePhase(null);
        } else {
          // If not active, activate it
          setActivePhase(phase);
        }
      });

      // Desktop hover (only for desktop, not mobile)
      element.addEventListener('mouseenter', function() {
        const item = this.closest('.timeline-item');
        if (!item.classList.contains('active')) {
          this.classList.add('hover-active');
        }
      });

      element.addEventListener('mouseleave', function() {
        const item = this.closest('.timeline-item');
        if (!item.classList.contains('active')) {
          this.classList.remove('hover-active');
        }
      });

      // Keyboard navigation
      element.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const phase = parseInt(this.closest('.timeline-item').dataset.phase);

          if (currentPhase === phase) {
            setActivePhase(null);
          } else {
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
      const bubble = item.querySelector('.timeline-bubble');

      if (phase === null) {
        // Collapse all phases
        item.classList.remove('active');
        bubble.classList.remove('hover-active');
        bubble.setAttribute('aria-expanded', 'false');
      } else if (parseInt(item.dataset.phase) === phase) {
        item.classList.add('active');
        bubble.classList.remove('hover-active'); // Remove hover when active
        bubble.setAttribute('aria-expanded', 'true');
      } else {
        item.classList.remove('active');
        bubble.classList.remove('hover-active');
        bubble.setAttribute('aria-expanded', 'false');
      }
    });

    // Update button states
    // prevBtn.disabled = phase === null || phase === 1;
    // nextBtn.disabled = phase === null || phase === totalPhases;
  }

  // Initialize timeline
  generateTimeline();
  setActivePhase(null); // Start with all phases collapsed
});
