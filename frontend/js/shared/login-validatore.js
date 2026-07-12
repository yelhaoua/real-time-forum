function validateEmail(input) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(input);
}

function validateUsername(input) {
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(input);
}

export function validateLogin(input) {
  return validateEmail(input) || validateUsername(input);
}
