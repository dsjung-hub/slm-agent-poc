import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCMAhzThQbNKs6UpzfysbzEji1qHi-CKho",
  authDomain: "pl-agent-poc.firebaseapp.com",
  projectId: "pl-agent-poc",
  storageBucket: "pl-agent-poc.firebasestorage.app",
  messagingSenderId: "1099031062367",
  appId: "1:1099031062367:web:6bf75315ec9d4e941378ea"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const reqNoEl = document.getElementById("reqNo");
const titleEl = document.getElementById("title");
const categoryEl = document.getElementById("category");
const statusEl = document.getElementById("status");
const requesterEl = document.getElementById("requester");
const phoneEl = document.getElementById("phone");
const emailEl = document.getElementById("email");
const dateEl = document.getElementById("date");
const contentEl = document.getElementById("content");
const memoEl = document.getElementById("memo");

const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");

function setToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  dateEl.value = `${year}-${month}-${day}`;
}

function resetForm() {
  reqNoEl.value = "";
  titleEl.value = "";
  categoryEl.value = "";
  statusEl.value = "접수";
  requesterEl.value = "";
  phoneEl.value = "";
  emailEl.value = "";
  contentEl.value = "";
  memoEl.value = "";
  setToday();
  reqNoEl.focus();
}

function validateForm() {
  if (!reqNoEl.value.trim()) {
    alert("요구사항 번호를 입력하세요.");
    reqNoEl.focus();
    return false;
  }

  if (!titleEl.value.trim()) {
    alert("제목을 입력하세요.");
    titleEl.focus();
    return false;
  }

  if (!categoryEl.value.trim()) {
    alert("민원 유형을 선택하세요.");
    categoryEl.focus();
    return false;
  }

  if (!requesterEl.value.trim()) {
    alert("신청자를 입력하세요.");
    requesterEl.focus();
    return false;
  }

  if (!dateEl.value.trim()) {
    alert("요청일자를 입력하세요.");
    dateEl.focus();
    return false;
  }

  if (!contentEl.value.trim()) {
    alert("요청내용을 입력하세요.");
    contentEl.focus();
    return false;
  }

  return true;
}

async function saveRequest() {
  if (!validateForm()) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "등록중...";

  try {
    const data = {
      reqNo: reqNoEl.value.trim(),
      title: titleEl.value.trim(),
      category: categoryEl.value.trim(),
      status: statusEl.value.trim(),
      requester: requesterEl.value.trim(),
      phone: phoneEl.value.trim(),
      email: emailEl.value.trim(),
      requestDate: dateEl.value,
      content: contentEl.value.trim(),
      memo: memoEl.value.trim(),
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, "complaints"), data);

    alert("민원이 정상적으로 등록되었습니다.");
    resetForm();
  } catch (error) {
    console.error("등록 오류:", error);
    alert("등록 중 오류가 발생했습니다. 콘솔을 확인하세요.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "등록";
  }
}

submitBtn.addEventListener("click", saveRequest);
resetBtn.addEventListener("click", resetForm);

window.addEventListener("DOMContentLoaded", () => {
  setToday();
});
