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

async function getNextReqNo() {
  const snapshot = await getDocs(collection(db, "complaints"));

  if (snapshot.empty) return 1;

  let maxReqNo = 0;
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const no = Number(data.reqNo || 0);
    if (no > maxReqNo) {
      maxReqNo = no;
    }
  });

  return maxReqNo + 1;
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
    snapshot.forEach((docSnap) => {
      const item = docSnap.data();
      html += `
        <tr>
          <td>${escapeHtml(item.reqNo ?? "-")}</td>
          <td>${escapeHtml(item.title ?? "")}</td>
          <td>${escapeHtml(item.requester ?? "")}</td>
          <td>${escapeHtml(item.system ?? "")}</td>
          <td>${escapeHtml(item.priority ?? "")}</td>
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
  const submitBtn = document.getElementById("submitBtn");

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
    submitBtn.disabled = true;
    submitBtn.textContent = "등록 중...";

    const nextReqNo = await getNextReqNo();

    await addDoc(collection(db, "complaints"), {
      reqNo: nextReqNo,
      title: complaintTitle,
      requester: requester,
      system: systemName,
      priority: priority,
      content: detail,
      status: "접수",
      createdAt: serverTimestamp()
    });

    alert(`민원이 Firebase에 저장되었습니다. 요구사항 번호는 ${nextReqNo}번입니다.`);
    resetComplaintForm();
    await loadRecentComplaints();
  } catch (error) {
    console.error("민원 저장 오류:", error);
    alert("저장 중 오류가 발생했습니다. F12 → Console을 확인하세요.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "등록";
  }
}

function resetComplaintForm() {
  document.getElementById("complaintTitle").value = "";
  document.getElementById("requester").value = "";
  document.getElementById("systemName").value = "";
  document.getElementById("priority").value = "중";
  document.getElementById("detail").value = "";
}

window.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("submitBtn")?.addEventListener("click", submitComplaint);
  document.getElementById("resetBtn")?.addEventListener("click", resetComplaintForm);
  await loadRecentComplaints();
});
