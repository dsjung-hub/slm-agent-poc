import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
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

const statusEl = document.getElementById("status");
const tbodyEl = document.getElementById("tbody");

let allRequests = [];

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "-";

  if (typeof value === "string") return value;

  if (value.seconds) {
    const date = new Date(value.seconds * 1000);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return "-";
}

function shortenText(text, maxLength = 15) {
  const safeText = (text || "").trim();
  if (!safeText) return "-";
  if (safeText.length <= maxLength) return safeText;
  return safeText.substring(0, maxLength) + "...";
}

function renderTable(list) {
  if (!tbodyEl) return;

  if (!list.length) {
    tbodyEl.innerHTML = `
      <tr>
        <td colspan="7" class="empty-row">조회된 민원이 없습니다.</td>
      </tr>
    `;
    return;
  }

  tbodyEl.innerHTML = list
    .map((item, index) => {
      const reqNo = escapeHtml(item.reqNo || "-");
      const title = escapeHtml(item.title || "-");
      const category = escapeHtml(item.category || "-");
      const status = escapeHtml(item.status || "-");
      const requester = escapeHtml(item.requester || "-");
      const requestDate = escapeHtml(formatDate(item.requestDate || item.createdAt));
      const contentSummary = escapeHtml(shortenText(item.content, 15));
      const contentDetail = escapeHtml(item.content || "-");
      const memo = escapeHtml(item.memo || "-");
      const phone = escapeHtml(item.phone || "-");
      const email = escapeHtml(item.email || "-");

      return `
        <tr class="data-row" data-detail-id="detail-${index}">
          <td>${reqNo}</td>
          <td>${title}</td>
          <td>${category}</td>
          <td>${status}</td>
          <td>${requester}</td>
          <td>${requestDate}</td>
          <td>${contentSummary}</td>
        </tr>
        <tr class="detail-row" id="detail-${index}" style="display:none;">
          <td colspan="7">
            <div class="detail-box">
              <p><strong>요구사항 번호:</strong> ${reqNo}</p>
              <p><strong>제목:</strong> ${title}</p>
              <p><strong>민원 유형:</strong> ${category}</p>
              <p><strong>처리상태:</strong> ${status}</p>
              <p><strong>신청자:</strong> ${requester}</p>
              <p><strong>연락처:</strong> ${phone}</p>
              <p><strong>이메일:</strong> ${email}</p>
              <p><strong>요청일자:</strong> ${requestDate}</p>
              <p><strong>요청내용:</strong><br>${contentDetail.replace(/\n/g, "<br>")}</p>
              <p><strong>비고:</strong><br>${memo.replace(/\n/g, "<br>")}</p>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  bindDetailEvents();
}

function bindDetailEvents() {
  const rows = document.querySelectorAll(".data-row");

  rows.forEach((row) => {
    row.addEventListener("click", () => {
      const detailId = row.dataset.detailId;
      const detailRow = document.getElementById(detailId);

      if (!detailRow) return;

      const isOpen = detailRow.style.display === "table-row";

      document.querySelectorAll(".detail-row").forEach((el) => {
        el.style.display = "none";
      });

      if (!isOpen) {
        detailRow.style.display = "table-row";
      }
    });
  });
}

function applyFilter() {
  const selectedStatus = statusEl ? statusEl.value : "";

  let filtered = [...allRequests];

  if (selectedStatus) {
    filtered = filtered.filter((item) => item.status === selectedStatus);
  }

  renderTable(filtered);
}

async function loadRequests() {
  try {
    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    allRequests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    applyFilter();
  } catch (error) {
    console.error("조회 오류:", error);

    if (tbodyEl) {
      tbodyEl.innerHTML = `
        <tr>
          <td colspan="7" class="empty-row">데이터를 불러오는 중 오류가 발생했습니다.</td>
        </tr>
      `;
    }
  }
}

if (statusEl) {
  statusEl.addEventListener("change", applyFilter);
}

window.addEventListener("DOMContentLoaded", loadRequests);
