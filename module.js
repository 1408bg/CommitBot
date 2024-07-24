const base = {
  token : null,
  name : null,
  repo : null
}

export const getBase = () => {
  const temp = { ...base };
  return temp.freeze();
}

export const setBase = (newBase) => {
  if (newBase.token == null || newBase.name == null || newBase.repo == null){ throw new Error("invaild data"); }
  base.token = newBase.token;
  base.name = newBase.name;
  base.repo = newBase.repo;
}

export const readFrom = async (owner, repo, path) => {
  if (base.name == null || base.repo == null || base.token == null){ throw new Error("initalize base first"); }
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        "Authorization": `token ${base.token}`,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`error : ${response.status} ${response.statusText}`);
    }
    const data = response.json();
    return atob(data.content);
  } catch (err) {
    throw new Error(`error : ${err.message}`);
  }
}

export const commit = async (path, content, message) => {
  if (base.name == null || base.repo == null || base.token == null) { 
    throw new Error("initialize base first"); 
  }
  try {
    let res = await fetch(`https://api.github.com/repos/${base.name}/${base.repo}/contents/${path}`, {
      headers: {
        "Authorization": `token ${base.token}`,
        "Content-Type": "application/json"
      }
    });
    if (res.status === 404) {
      res = await fetch(`https://api.github.com/repos/${base.name}/${base.repo}/contents/${path}`, {
        method: "PUT",
        headers: {
          "Authorization": `token ${base.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: message,
          content: btoa(content)
        })
      });
    } else {
      const temp = await res.json();
      const sha = temp.sha;
      res = await fetch(`https://api.github.com/repos/${base.name}/${base.repo}/contents/${path}`, {
        method: "PUT",
        headers: {
          "Authorization": `token ${base.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: message,
          content: btoa(content),
          sha: sha
        })
      });
    }
    return res.json();
  } catch (err) {
    throw new Error(`error : ${err.message}`);
  }
};
