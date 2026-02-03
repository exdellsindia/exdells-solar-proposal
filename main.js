window.__chartsReady = false;

const proposalData = {
  client: {
    name: 'Ananya Rao',
    location: 'Hyderabad, Telangana',
    proposalId: 'EXD-2024-014',
    preparedDate: '22 Aug 2024',
    consultant: {
      name: 'Riya Mehta',
      email: 'riya@exdells.com'
    }
  },
  system: {
    capacityKw: 8.5,
    performanceRatio: 0.79,
    baseCost: 520000,
    subsidy: 78000,
    gstRate: 0.18,
    tariffPerUnit: 8.2,
    escalationRate: 0.05
  },
  assumptions: {
    solarIrradiation: [
      4.2, 4.6, 5.1, 5.6, 5.8, 5.4, 4.9, 4.8, 5.1, 5.4, 4.9, 4.3
    ],
    daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  }
};

const formatCurrency = (value) => {
  return `₹${value.toLocaleString('en-IN')}`;
};

const calculateGST = (baseCost, gstRate) => baseCost * gstRate;
const calculateTotalWithGST = (baseCost, gstRate) => baseCost + calculateGST(baseCost, gstRate);
const calculateNetPayable = (totalCost, subsidy) => Math.max(totalCost - subsidy, 0);

const calculateMonthlyGeneration = (capacityKw, irradiation, performanceRatio, days) => {
  return irradiation.map((sunHours, index) => {
    const dailyGeneration = capacityKw * sunHours * performanceRatio;
    return Math.round(dailyGeneration * days[index]);
  });
};

const calculateAnnualGeneration = (monthlyGeneration) =>
  monthlyGeneration.reduce((total, value) => total + value, 0);

const calculateSavings = (energy, tariff) => energy * tariff;

const calculatePayback = (netPayable, annualSavings) => (annualSavings === 0 ? 0 : netPayable / annualSavings);

const calculateLifetimeSavings = (annualSavings, escalationRate, years) => {
  let total = 0;
  for (let i = 0; i < years; i += 1) {
    total += annualSavings * Math.pow(1 + escalationRate, i);
  }
  return total;
};

const calculateRoiGrowth = (annualSavings, escalationRate, years) => {
  const values = [];
  let cumulative = 0;
  for (let i = 1; i <= years; i += 1) {
    cumulative += annualSavings * Math.pow(1 + escalationRate, i - 1);
    values.push(Math.round(cumulative));
  }
  return values;
};

const updateText = (id, value) => {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
};

const renderCharts = (monthlyGeneration, roiGrowth) => {
  const generationCtx = document.getElementById('generationChart');
  const roiCtx = document.getElementById('roiChart');
  let chartsCompleted = 0;

  const onChartComplete = () => {
    chartsCompleted += 1;
    if (chartsCompleted >= 2) {
      window.__chartsReady = true;
    }
  };

  // eslint-disable-next-line no-new
  new Chart(generationCtx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Generation (kWh)',
          data: monthlyGeneration,
          backgroundColor: 'rgba(29, 98, 194, 0.85)',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      animation: {
        duration: 800,
        onComplete: onChartComplete
      },
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          ticks: { color: '#6b7a90' },
          grid: { color: 'rgba(15, 26, 43, 0.08)' }
        },
        x: {
          ticks: { color: '#6b7a90' },
          grid: { display: false }
        }
      }
    }
  });

  // eslint-disable-next-line no-new
  new Chart(roiCtx, {
    type: 'line',
    data: {
      labels: roiGrowth.map((_, index) => `Y${index + 1}`),
      datasets: [
        {
          label: 'Cumulative Savings',
          data: roiGrowth,
          borderColor: '#0b3b8f',
          backgroundColor: 'rgba(11, 59, 143, 0.12)',
          tension: 0.35,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      animation: {
        duration: 900,
        onComplete: onChartComplete
      },
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          ticks: { color: '#6b7a90' },
          grid: { color: 'rgba(15, 26, 43, 0.08)' }
        },
        x: {
          ticks: { color: '#6b7a90', maxRotation: 0, autoSkip: true },
          grid: { display: false }
        }
      }
    }
  });
};

const initProposal = () => {
  const { client, system, assumptions } = proposalData;

  const gstAmount = calculateGST(system.baseCost, system.gstRate);
  const totalCost = calculateTotalWithGST(system.baseCost, system.gstRate);
  const netPayable = calculateNetPayable(totalCost, system.subsidy);

  const monthlyGeneration = calculateMonthlyGeneration(
    system.capacityKw,
    assumptions.solarIrradiation,
    system.performanceRatio,
    assumptions.daysInMonth
  );
  const annualGeneration = calculateAnnualGeneration(monthlyGeneration);
  const monthlyAverage = Math.round(annualGeneration / 12);
  const monthlySavings = calculateSavings(monthlyAverage, system.tariffPerUnit);
  const annualSavings = calculateSavings(annualGeneration, system.tariffPerUnit);
  const paybackPeriod = calculatePayback(netPayable, annualSavings);
  const lifetimeSavings = calculateLifetimeSavings(annualSavings, system.escalationRate, 25);
  const roiGrowth = calculateRoiGrowth(annualSavings, system.escalationRate, 25);

  const annualCo2 = annualGeneration * 0.00077;
  const treesEquivalent = Math.round(annualCo2 * 45);
  const coalSaved = annualGeneration * 0.0005;

  updateText('client-name', client.name);
  updateText('client-location', client.location);
  updateText('proposal-id', client.proposalId);
  updateText('prepared-date', client.preparedDate);
  updateText('consultant-name', client.consultant.name);
  updateText('consultant-email', client.consultant.email);

  updateText('system-size', `${system.capacityKw} kW`);
  updateText('overview-capacity', `${system.capacityKw} kW`);
  updateText('performance-ratio', `${Math.round(system.performanceRatio * 100)}%`);

  updateText('base-cost', formatCurrency(system.baseCost));
  updateText('gst-amount', formatCurrency(Math.round(gstAmount)));
  updateText('total-cost', formatCurrency(Math.round(totalCost)));
  updateText('total-cost-table', formatCurrency(Math.round(totalCost)));
  updateText('subsidy', `- ${formatCurrency(system.subsidy)}`);
  updateText('net-payable', formatCurrency(Math.round(netPayable)));
  updateText('net-payable-table', formatCurrency(Math.round(netPayable)));

  updateText('annual-generation', annualGeneration.toLocaleString('en-IN'));
  updateText('monthly-generation', monthlyAverage.toLocaleString('en-IN'));
  updateText('annual-co2', `${annualCo2.toFixed(1)} Tons`);
  updateText('payback-period', `${paybackPeriod.toFixed(1)} yrs`);
  updateText('lifetime-savings', formatCurrency(Math.round(lifetimeSavings)));

  updateText('co2-offset', `${annualCo2.toFixed(1)} Tons`);
  updateText('trees-equivalent', `${treesEquivalent} Trees`);
  updateText('coal-saved', `${coalSaved.toFixed(1)} Tons`);

  renderCharts(monthlyGeneration, roiGrowth);
};

window.addEventListener('load', initProposal);
