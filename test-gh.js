const fs = require('fs');
fetch('https://api.github.com/repos/jahau8051-cloudd/ijregij/actions/runs')
  .then(res => res.json())
  .then(data => {
    if (data.message) {
      console.log('API Error:', data.message);
    } else {
      const latest = data.runs[0];
      console.log('Latest Run ID:', latest.id);
      console.log('Status:', latest.status);
      console.log('Conclusion:', latest.conclusion);
      
      // Fetch jobs for the latest run
      return fetch(latest.jobs_url)
        .then(res => res.json())
        .then(jobsData => {
          jobsData.jobs.forEach(job => {
            console.log('Job:', job.name, 'Conclusion:', job.conclusion);
            job.steps.forEach(step => {
               if (step.conclusion === 'failure') {
                 console.log('FAILED STEP:', step.name);
               }
            });
          });
        });
    }
  });
