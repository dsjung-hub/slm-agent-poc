const data = [
  {id: 1, name: "민원 A", status: "접수"},
  {id: 2, name: "민원 B", status: "처리중"},
  {id: 3, name: "민원 C", status: "완료"},
  {id: 4, name: "민원 D", status: "반려"}
];

function search() {
  const status = document.getElementById("status").value;
  const tbody = document.querySelector("#result tbody");

  tbody.innerHTML = "";

  let result = data;

  if (status !== "") {
    result = data.filter(d => d.status === status);
  }

  result.forEach(d => {
    const row = `
      <tr>
        <td>${d.id}</td>
        <td>${d.name}</td>
        <td>${d.status}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  });

  saveLog(status);
}

// 로그 저장 (POC)
function saveLog(status) {
  console.log("검색 로그 저장:", status);
}
