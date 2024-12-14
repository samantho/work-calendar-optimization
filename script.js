document.addEventListener("DOMContentLoaded", function () {
    const scheduleContainer = document.getElementById('schedule-container');
    const fileInput = document.getElementById('file-input');
    const loadButton = document.getElementById('load-button');
  
    loadButton.addEventListener('click', function() {
      const file = fileInput.files[0]; // Get the file from the input
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            const data = JSON.parse(e.target.result); // Parse the JSON data
            if (data && Array.isArray(data.employees)) {
              scheduleContainer.innerHTML = ''; // Clear previous content
              generateSchedule(data); // Generate the schedule based on the data
            } else {
              alert("Invalid JSON structure.");
            }
          } catch (error) {
            console.error('Error reading the file:', error);
            alert("Failed to parse JSON.");
          }
        };
        reader.readAsText(file); // Read the file as text
      } else {
        alert("Please select a JSON file.");
      }
    });
  
    function generateSchedule(data) {
      const uniqueDaysOff = getUniqueDaysOff(data);
  
      // Sort the days by date
      uniqueDaysOff.sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA - dateB; // Ascending order
      });
  
      uniqueDaysOff.forEach(date => {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.dataset.date = date;
  
        const dayHeader = document.createElement('h3');
        dayHeader.textContent = `Day: ${date}`;
        dayElement.appendChild(dayHeader);
  
        // Checklist for employees
        const checklist = document.createElement('div');
        checklist.classList.add('checklist');
        data.employees.forEach(employee => {
          const checkboxLabel = document.createElement('label');
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.disabled = employee.daysOff.includes(date);
          checkbox.checked = false;
          checkbox.dataset.employee = employee.name;
          checkbox.dataset.date = date;
  
          if (checkbox.disabled) {
            checkboxLabel.style.textDecoration = 'line-through';
            checkboxLabel.style.color = 'grey';
          }
  
          checkbox.addEventListener('change', () => updateAccountCoverage(data));
  
          checkboxLabel.appendChild(checkbox);
          checkboxLabel.appendChild(document.createTextNode(employee.name));
          checklist.appendChild(checkboxLabel);
        });
  
        // Account coverage display for this day
        const accountsList = document.createElement('div');
        accountsList.classList.add('accounts-list');
        const allAccounts = getAllAccounts(data);
  
        allAccounts.forEach(account => {
          const accountDiv = document.createElement('div');
          accountDiv.classList.add('account');
          accountDiv.dataset.account = account;
          accountDiv.textContent = account;
          accountsList.appendChild(accountDiv);
        });
  
        // Everyday requirement indicator
        const everydayStatus = document.createElement('div');
        everydayStatus.classList.add('everyday-status');
        everydayStatus.textContent = 'Everyday Requirement: Unmet';
        everydayStatus.style.color = 'red';
        dayElement.appendChild(dayHeader);
        dayElement.appendChild(checklist);
        dayElement.appendChild(accountsList);
        dayElement.appendChild(everydayStatus);
  
        scheduleContainer.appendChild(dayElement);
      });
    }
  
    // Helper function to get unique days off from all employees
    function getUniqueDaysOff(data) {
      const daysOffSet = new Set();
      data.employees.forEach(employee => {
        employee.daysOff.forEach(day => {
          daysOffSet.add(day);
        });
      });
      return Array.from(daysOffSet);
    }
  
    // Helper function to get all unique accounts from employees
    function getAllAccounts(data) {
      const accounts = new Set();
      data.employees.forEach(employee => {
        employee.accounts.forEach(account => {
          accounts.add(account);
        });
      });
      return Array.from(accounts);
    }
  
    // Update the account coverage based on selected employees
    function updateAccountCoverage(data) {
        const allDays = document.querySelectorAll('.day');
        allDays.forEach(dayElement => {
          const date = dayElement.dataset.date;
          const selectedEmployees = [];
          const accountCoverage = {};  // Track how many people are covering each account
          let everydayCovered = false;  // Track if at least one 'everyday' employee is working
      
          // Loop through each employee and check if they're selected for the day
          data.employees.forEach(employee => {
            const checkbox = dayElement.querySelector(`input[data-employee="${employee.name}"][data-date="${date}"]`);
            if (checkbox && checkbox.checked) {
              selectedEmployees.push(employee.name);
      
              // Check if the employee has the 'everyday' flag and is covering this day
              if (employee.everyday) {
                everydayCovered = true;  // Mark as covered if any everyday employee is checked
              }
      
              // Loop through the accounts of the employee and count them for the day
              employee.accounts.forEach(account => {
                if (!accountCoverage[account]) {
                  accountCoverage[account] = 0;
                }
                accountCoverage[account]++;
              });
            }
          });
      
          // If no 'everyday' employee is covering the day, mark it visually
          const everydayStatus = dayElement.querySelector('.everyday-status');
          if (!everydayCovered) {
            everydayStatus.textContent = "Everyday coverage missing!";
            everydayStatus.style.color = 'red'; // Red to indicate missing everyday coverage
          } else {
            everydayStatus.textContent = "Everyday coverage met";
            everydayStatus.style.color = 'green'; // Green to indicate everyday coverage is met
          }
      
          // Update account coverage (change color based on the number of people covering)
          const accountsList = dayElement.querySelector('.accounts-list');
          const accounts = accountsList.querySelectorAll('.account');
      
          accounts.forEach(accountDiv => {
            const account = accountDiv.dataset.account;
            const coverageCount = accountCoverage[account] || 0;
      
            // Apply colors based on the coverage count
            if (coverageCount === 1) {
              accountDiv.classList.add('covered-green');
              accountDiv.classList.remove('covered-blue', 'covered-purple');
            } else if (coverageCount === 2) {
              accountDiv.classList.add('covered-blue');
              accountDiv.classList.remove('covered-green', 'covered-purple');
            } else if (coverageCount >= 3) {
              accountDiv.classList.add('covered-purple');
              accountDiv.classList.remove('covered-green', 'covered-blue');
            } else {
              accountDiv.classList.remove('covered-green', 'covered-blue', 'covered-purple');
            }
          });
        });
      }
           
  });
  