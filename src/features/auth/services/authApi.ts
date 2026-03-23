export const loginApi = async (username: string, password: string) => {
  try {
    const res = await fetch(
      `/api/admin/user/check?userName=${encodeURIComponent(username)}&userPwd=${encodeURIComponent(password)}`,
      {
        method: "GET",
        headers: {
          "Accept": "*/*",
        },
        credentials: "include",
      }
    );

    if (!res.ok) {
      console.error("Status:", res.status);
      throw new Error(`HTTP error: ${res.status}`);
    }

    const data = await res.json();
    return data;

  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
};