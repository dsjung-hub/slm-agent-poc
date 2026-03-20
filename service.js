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

function truncateText(value, maxLength = 15) {
  const text = String(value ?? "");
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

function formatDate(value) {
  if (!value) return "";

  try {
    if (typeof value === "string") {
      return value.replace("T", " ");
    }

    if (value.toDate) {
      return value.toDate().toLocaleString("ko-KR");
    }

    return String(value);
  } catch (e) {
    return String(value);
  }
}

async function loadComplaints() {
  const tbody = document.querySelector("#result tbody");
  const selectedStatus = document.getElementById("status")?.value ?? "";

  if (!tbody) return;

  tbody.innerHTML = "<tr><td colspan='8'>불러오는 중...</td></tr>";

  try {
    const snapshot = await getDocs(collection(db, "complaints"));

    if (snapshot.empty) {
      tbody.innerHTML = "<tr><td colspan='8'>등록된 민원이 없습니다.</td></tr>";
      return;
    }

    const items = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      items.push({
        docId: docSnap.id,
        id: data.id ?? data.reqNo ?? docSnap.id,
        title: data.title ?? "",
        requester: data.requester ?? "",
        system_name: data.system_name ?? "",
        priority: data.priority ?? "",
        detail: data.detail ?? "",
        status: data.status ?? "",
        created_at: data.created_at ?? ""
      });
    });

    items.sort((a, b) => {
      const aNum = Number(a.id);
      const bNum = Number(b.id);
      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
        return bNum - aNum;
      }
      return String(b.id).localeCompare(String(a.id));
    });

    const filtered = selectedStatus
      ? items.filter((item) => item.status === selectedStatus)
      : items;

    if (filtered.length === 0) {
      tbody.innerHTML = "<tr><td colspan='8'>조회 결과가 없습니다.</td></tr>";
      return;
    }

    let html = "";
    filtered.forEach((item, index) => {
      const shortDetail = truncateText(item.detail, 15);
      const detailId = `detail-${index}`;

      html += `
        <tr>
          <td>${escapeHtml(item.id)}</td>
          <td>${escapeHtml(item.title)}</td>
          <td>${escapeHtml(item.requester)}</td>
          <td>${escapeHtml(item.system_name)}</td>
          <td>${escapeHtml(item.priority)}</td>
          <td>
            <span 
              class="detail-toggle" 
              data-target="${detailId}"
              style="cursor:pointer; color:#0b57d0; text-decoration:underline;"
            >
              ${escapeHtml(shortDetail)}
            </span>
            <div 
              id="${detailId}" 
              class="detail-content" 
              style="display:none; margin-top:6px; white-space:pre-wrap; color:#333;"
            >
              ${escapeHtml(item.detail)}
            </div>
          </td>
          <td>${escapeHtml(item.status)}</td>
          <td>${escapeHtml(formatDate(item.created_at))}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

    document.querySelectorAll(".detail-toggle").forEach((el) => {
      el.addEventListener("click", () => {
        const targetId = el.getAttribute("data-target");
        const detailBox = document.getElementById(targetId);
        if (!detailBox) return;

        detailBox.style.display =
          detailBox.style.display === "none" ? "block" : "none";
      });
    });
  } catch (error) {
    console.error("민원 조회 오류:", error);
    tbody.innerHTML = "<tr><td colspan='8'>조회 중 오류가 발생했습니다.</td></tr>";
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("searchBtn")?.addEventListener("click", loadComplaints);
  await loadComplaints();
});
