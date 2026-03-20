import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Step 2에서 복사한 firebaseConfig로 교체
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

async function loadRecentComplaints() {
  const tbody = document.querySelector("#requestResult tbody");
  if (!tbody) return;

  tbody.innerHTML = "<tr><td colspan='5'>불러오는 중...</td></tr>";

  try {
    const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      tbody.innerHTML = "<tr><td colspan='5'>등록된 민원이 없습니다.</td></tr>";
      return;
    }

    let html = "";
    let no = 1;

    snapshot.forEach((doc) => {
      const item = doc.data();
      html += `
        <tr>
          <td>${no++}</td>
          <td>${escapeHtml(item.title)}</td>
          <td>${escapeHtml(item.requester)}</td>
          <td>${escapeHtml(item.system)}</td>
          <td>${escapeHtml(item.priority)}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  } catch (error) {
    console.error("최근 등록 내역 조회 오류:", error);
    tbody.innerHTML = "<tr><td colspan='5'>조회 중 오류가 발생했습니다.</td></tr>";
  }
}

async function submitComplaint() {
  const complaintTitle = document.getElementById("complaintTitle")?.value.trim();
  const requester = document.getElementById("requester")?.value.trim();
  const systemName = document.getElementById("systemName")?.value.trim();
  const priority = document.getElementById("priority")?.value;
  const detail = document.getElementById("detail")?.value.trim();

  if (!complaintTitle || !requester || !systemName || !priority || !detail) {
    alert("모든 항목을 입력하세요.");
    return;
  }

  try {
    await addDoc(collection(db, "complaints"), {
      title: complaintTitle,
      requester: requester,
      system: systemName,
      priority: priority,
      content: detail,
      status: "접수",
      createdAt: serverTimestamp()
    });

    alert("민원이 Firebase에 저장되었습니다.");
    resetComplaintForm();
    await loadRecentComplaints();
  } catch (error) {
    console.error("민원 저장 오류:", error);
    alert("저장 중 오류가 발생했습니다. 콘솔을 확인하세요.");
  }
}

function resetComplaintForm() {
  document.getElementById("complaintTitle").value = "";
  document.getElementById("requester").value = "";
  document.getElementById("systemName").value = "";
  document.getElementById("priority").value = "중";
  document.getElementById("detail").value = "";
}

window.submitComplaint = submitComplaint;
window.resetComplaintForm = resetComplaintForm;

window.addEventListener("DOMContentLoaded", async () => {
  await loadRecentComplaints();
});
