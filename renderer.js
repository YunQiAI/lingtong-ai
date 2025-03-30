const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { analyzeImage } = require('./vision-api');
const { ipcRenderer } = require('electron');

let messageHistory = [
  { role: "system", content: "你是一个专业的通用 AI 助手，请根据用户输入进行分析和建议。" }
];

const historyPath = path.join(__dirname, 'local_storage');
const regionPath = path.join(historyPath, 'captureRegion.json');
const resultBox = () => document.getElementById('result');

function ensureDir() {
  if (!fs.existsSync(historyPath)) fs.mkdirSync(historyPath);
}

function saveRegion(region) {
  ensureDir();
  fs.writeFileSync(regionPath, JSON.stringify(region, null, 2), 'utf-8');
}

function loadRegion() {
  try {
    const content = fs.readFileSync(regionPath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

function saveHistoryToFile() {
  ensureDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(historyPath, `chat-${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(messageHistory, null, 2), 'utf-8');
  loadHistoryList();
}

function loadHistoryList() {
  ensureDir();
  const historyDiv = document.getElementById('history');
  if (!historyDiv) return;
  historyDiv.innerHTML = '';
  const files = fs.readdirSync(historyPath).filter(f => f.endsWith('.json') && f.startsWith('chat-')).sort().reverse();
  files.forEach(file => {
    const div = document.createElement('div');
    div.className = 'history-entry';
    div.innerText = file.replace('chat-', '').replace('.json', '');
    div.onclick = () => loadHistoryFile(path.join(historyPath, file));
    historyDiv.appendChild(div);
  });
}

function loadHistoryFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  try {
    const messages = JSON.parse(content);
    messageHistory = messages;
    const result = resultBox();
    result.innerText = '';
    messages.forEach(m => {
      if (m.role === 'user') appendMessage('你', m.content);
      if (m.role === 'assistant') appendMessage('AI', m.content);
    });
  } catch (e) {
    console.error("加载历史失败：", e);
  }
}

async function runAnalysis(auto = false) {
  const tempPath = '/tmp/lingtong_clip.png';
  const region = loadRegion();
  let cmd = auto && region
    ? `screencapture -R${region.x},${region.y},${region.width},${region.height} ${tempPath}`
    : `screencapture -i ${tempPath}`;
  appendMessage('系统', auto ? '[自动截图中...]' : '[请框选截图区域]');
  exec(cmd, async (error) => {
    if (error) return appendMessage('系统', '截图失败。');
    if (!auto) {
      const { createCanvas, loadImage } = require('canvas');
      try {
        const image = await loadImage(tempPath);
        saveRegion({ x: 0, y: 0, width: image.width, height: image.height });
      } catch (e) {}
    }
    document.getElementById('preview').src = tempPath;
    appendMessage('系统', '[上传并分析中...]');
    try {
      const result = await analyzeImage(tempPath);
      appendMessage('AI', result);
      messageHistory.push({ role: "assistant", content: result });
      speak(result);
      saveHistoryToFile();
    } catch (err) {
      appendMessage('系统', '分析失败：' + err.message);
    }
  });
}

function sendMessage() {
  const input = document.getElementById('userInput');
  const message = input.value.trim();
  if (!message) return;
  appendMessage('你', message);
  messageHistory.push({ role: "user", content: message });
  input.value = '';
  appendMessage('AI', '正在思考中...');
  setTimeout(() => {
    const reply = '（模拟回应）请准备爆发输出或等待时机。';
    updateLastAssistantMessage(reply);
    messageHistory.push({ role: "assistant", content: reply });
    speak(reply);
    saveHistoryToFile();
  }, 1500);
}

function appendMessage(who, content) {
  resultBox().innerText += `\\n${who}：${content}\\n`;
}

function updateLastAssistantMessage(content) {
  resultBox().innerText = resultBox().innerText.replace(/AI：正在思考中\\.\\.\\.\\n$/, `AI：${content}\\n`);
}

function speak(text) {
  if (process.platform === 'darwin') {
    exec(`say "${text.replace(/["\\\\]/g, '')}"`);
  }
}

ipcRenderer.on('trigger-analysis', () => runAnalysis(true));
document.getElementById('analyzeBtn').addEventListener('click', () => runAnalysis(false));
loadHistoryList();
