const inputLog = [];
let currentNumber = 1;
let startSet = false;
let selectedPattern = null;

function switchTab(id, event) {
  document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

function setStart() {
  const input = document.getElementById("startNumber").value;
  currentNumber = parseInt(input) || 1;
  startSet = true;
  alert(`تم تعيين رقم البداية إلى: ${currentNumber}`);
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.btn-pattern').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-pattern').forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedPattern = btn.getAttribute('data-value');
    });
  });
});

function registerPattern() {
  if (!startSet) return alert("يرجى تحديد رقم البداية أولاً.");
  if (!selectedPattern) return alert("يرجى اختيار خانة أولاً.");
  inputLog.push(`${currentNumber} - ${selectedPattern}`);
  currentNumber++;
  selectedPattern = null;
  document.querySelectorAll('.btn-pattern').forEach(b => b.classList.remove("selected"));
}

function undoLast() {
  if (inputLog.length > 0) {
    inputLog.pop();
    currentNumber--;
  } else {
    alert("لا توجد بيانات للتراجع عنها.");
  }
}

function resetAll() {
  if (confirm("هل تريد حذف جميع البيانات؟")) {
    inputLog.length = 0;
    currentNumber = parseInt(document.getElementById("startNumber").value) || 1;
    alert("تم إعادة التهيئة.");
  }
}

function exportToDocx() {
  let content = 'قائمة الضربات:\n\n' + inputLog.join("\n");
  const blob = new Blob([content], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8"
  });
  saveAs(blob, "بيانات_الضربات.docx");
}

function analyzeX40() {
  let report = 'تحليل ضربات X40:\n\n';
  let last = null, count = 0, rounds = [];
  inputLog.forEach(entry => {
    const [roundStr, value] = entry.split(" - ");
    if (value.includes("X40")) {
      const round = parseInt(roundStr);
      const dir = value.endsWith("-R") ? "يمين" : "يسار";
      const diff = last ? (round - last) : "أول مرة";
      count++;
      report += `#${count} - الجولة ${round} (${dir})`;
      if (last) report += ` - بعد ${diff} ضربة`;
      report += `\n`;
      rounds.push(round);
      last = round;
    }
  });
  if (count === 0) report += "\nلم يتم تسجيل أي ضربات X40.";
  else report += `\nإجمالي: ${count} مرات\nالجولات: ${rounds.join(", ")}`;
  const blob = new Blob([report], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8"
  });
  saveAs(blob, "تحليل_X40.docx");
}

function analyzePatterns() {
  let report = 'تحليل الأنماط:\n\n';
  let freq = {}, last = null, repCount = 1;
  inputLog.forEach((entry, i) => {
    const val = entry.split(" - ")[1];
    freq[val] = (freq[val] || 0) + 1;
    if (last === val) repCount++;
    else {
      if (repCount >= 3) report += `تكرار: ${last} ظهر ${repCount} مرات\n`;
      if (last && last.startsWith("X") && val.startsWith("X40"))
        report += `قفزة من ${last} إلى ${val} عند الضربة ${i + 1}\n`;
      repCount = 1;
    }
    last = val;
  });
  report += '\nعدد مرات كل نوع:\n';
  for (let k in freq) report += `- ${k}: ${freq[k]} مرات\n`;
  const blob = new Blob([report], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8"
  });
  saveAs(blob, "تحليل_الأنماط.docx");
}

function runSmartPrediction() {
  const recent = inputLog.slice(-20);
  const output = document.getElementById("predictionResults");
  if (recent.length < 5) {
    output.innerHTML = "<p>أدخل على الأقل 5 ضربات لبدء التوقع الذكي.</p>";
    return;
  }

  const freq = {};
  recent.forEach(entry => {
    const value = entry.split(" - ")[1];
    freq[value] = (freq[value] || 0) + 1;
  });

  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  output.innerHTML = "<h4>توقع الضربة القادمة:</h4><ul>" +
    sorted.map(([val, count]) =>
      `<li>${val} - نسبة ${(count / recent.length * 100).toFixed(1)}%</li>`
    ).join("") + "</ul>";
}
