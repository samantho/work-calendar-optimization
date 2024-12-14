document.addEventListener("DOMContentLoaded", function () {
    const scheduleContainer = document.getElementById('schedule-container');
  
    // Fetch the employee data from the external JSON file
    fetch('employees.json')
      .then(response => response.json())
      .then(data => {
        if (data && Array.isArray(data.employees)) {
          generateSchedule(data);
        } else {
          console.error("Invalid employee data format");
        }
      })
      .catch(error => {
        console.error('Error loading employee data:', error);
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
        let everydayCovered = false;
  
        // Loop through each employee and check if they're selected for the day
        data.employees.forEach(employee => {
          const checkbox = dayElement.querySelector(`input[data-employee="${employee.name}"][data-date="${date}"]`);
          if (checkbox && checkbox.checked) {
            selectedEmployees.push(employee.name);
  
            // Check if the employee has the everyday flag
            if (employee.everyday && !employee.daysOff.includes(date)) {
              everydayCovered = true;
            }
          }
        });
  
        // Update the everyday requirement
        const everydayStatus = dayElement.querySelector('.everyday-status');
        if (everydayCovered) {
          everydayStatus.textContent = 'Everyday Requirement: Met';
          everydayStatus.style.color = 'green';
        } else {
          everydayStatus.textContent = 'Everyday Requirement: Unmet';
          everydayStatus.style.color = 'red';
        }
  
        // Update account coverage (red -> green)
        const accountsList = dayElement.querySelector('.accounts-list');
        const accounts = accountsList.querySelectorAll('.account');
  
        accounts.forEach(accountDiv => {
          accountDiv.classList.remove('covered');  // Reset coverage
          selectedEmployees.forEach(employeeName => {
            const employee = data.employees.find(emp => emp.name === employeeName);
            if (employee && employee.accounts.includes(accountDiv.dataset.account)) {
              accountDiv.classList.add('covered');
            }
          });
        });
      });
    }
  });
  