export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

export function getCsrfToken() {
  // Django's default cookie name is "csrftoken"
  return getCookie("csrftoken");
}