// for (let i = 1; i <= 5; i++) {
//   console.log(String(i).repeat(i));
// }

// const button = document.getElementById("test");

// button.addEventListener("click", function () {
//   alert("meow meow nigga 🥵");
// });

async function fetchData() {
  try {
    let response = await fetch("https://jsonplaceholder.typicode.com/posts");
    let data = await response.json();
    console.log(data);
    console.log("Data fetched succesfully");
  } catch (error) {
    console.log("Error", error);
  }
}
fetchData();
