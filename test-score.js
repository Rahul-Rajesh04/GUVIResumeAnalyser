(async () => {
  const res = await fetch("http://localhost:3001/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jobText: "React developer skilled in React, JavaScript, and Node.js",
      resumeData: { skills: ["React", "HTML", "CSS", "Express"] },
      resumeText: "Rahul Rajesh, React Developer experienced in React, Node.js, Express, HTML, and CSS."
    }),
  });
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
})();
