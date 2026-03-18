const requests = [
  { no: 1, title: "처리상태 검색조건 추가", requester: "홍길동", system: "민원조회 시스템", priority: "중" }
];

function renderRequests() {
  const tbody = document.querySelector("#requestResult tbody");
  tbody.innerHTML = "";
  requests.forEach(item => {
    tbody.innerHTML += `
      <tr>
        <td>${item.no}</td>
        <td>${item.title}</td>
        <td>${item.requester}</td>
        <td>${item.system}</td>
        <td>${item.priority}</td>
      </tr>
    `;
  });
}

function submitComplaint() {
  const title = document.getElementById("complaintTitle").value.trim();
  const requester = document.getElementById("requester").value.trim();
  const system = document.getElementById("systemName").value.trim();
  const priority = document.getElementById("priority").value;

  if (!title || !requester || !system) {
    alert("민원명, 요청자, 시스템명은 필수입니다.");
    return;
  }

  requests.unshift({
    no: requests.length + 1,
    title,
    requester,
    system,
    priority
  });

  renderRequests();
  alert("민원이 등록되었습니다.");
  resetComplaintForm();
}

function resetComplaintForm() {
  document.getElementById("complaintTitle").value = "";
  document.getElementById("requester").value = "";
  document.getElementById("systemName").value = "";
  document.getElementById("priority").value = "중";
  document.getElementById("detail").value = "";
}

window.onload = renderRequests;
