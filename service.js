import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// request.js에 넣은 것과 동일한 firebaseConfig 사용
const firebaseConfig = {
  apiKey: "여기에_apiKey",
  authDomain: "여기에_authDomain",
  projectId: "여기에_projectId",
  storageBucket: "여기에_storageBucket",
  messagingSenderId: "여기에_messagingSenderId",
  appId: "여기에_appId"
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
    const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      tbody.innerHTML = "<tr><td colspan='3'>등록된 민원이 없습니다.</td></tr>";
      return;
    }

    let html = "";
    let id = 1;

    snapshot.forEach((doc) => {
      const item = doc.data();

      if (selectedStatus && item.status !== selectedStatus) {
        return;
      }

      html += `
        <tr>
          <td>${id++}</td>
          <td>${escapeHtml(item.title)}</td>
          <td>${escapeHtml(item.status)}</td>
        </tr>
      `;
    });

    if (!html) {
      tbody.innerHTML = "<tr><td colspan='3'>조회 결과가 없습니다.</td></tr>";
      return;
    }

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
