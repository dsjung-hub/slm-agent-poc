import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function loadComplaints() {
  const tbody = document.querySelector("#result tbody");
  const selectedStatus = document.getElementById("status")?.value ?? "";

  if (!tbody) return;

  tbody.innerHTML = "<tr><td colspan='3'>불러오는 중...</td></tr>";

  try {
    const snapshot = await getDocs(collection(db, "complaints"));

    if (snapshot.empty) {
      tbody.innerHTML = "<tr><td colspan='3'>등록된 민원이 없습니다.</td></tr>";
      return;
    }

    const items = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        reqNo: data.reqNo ?? "-",
        title: data.title ?? "",
        status: data.status ?? "",
        createdAt: data.createdAt ?? null
      });
    });

    items.sort((a, b) => Number(b.reqNo || 0) - Number(a.reqNo || 0));

    const filtered = selectedStatus
      ? items.filter(item => item.status === selectedStatus)
      : items;

    if (filtered.length === 0) {
      tbody.innerHTML = "<tr><td colspan='3'>조회 결과가 없습니다.</td></tr>";
      return;
    }

    let html = "";
    filtered.forEach((item) => {
      html += `
        <tr>
          <td>${escapeHtml(item.reqNo)}</td>
          <td>${escapeHtml(item.title)}</td>
          <td>${escapeHtml(item.status)}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  } catch (error) {
    console.error("민원 조회 오류:", error);
    tbody.innerHTML = "<tr><td colspan='3'>조회 중 오류가 발생했습니다.</td></tr>";
  }
}

function search() {
  loadComplaints();
}

window.search = search;

window.addEventListener("DOMContentLoaded", async () => {
  await loadComplaints();
});
