// Firebaseのauthとdbをwindowオブジェクトから取得
const auth = window.firebaseAuth;
const db = window.firebaseDb;

// ログインフォームの要素を取得
const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = loginForm["login-email"].value;
  const password = loginForm["password"].value;

  // Firebase Authenticationを使用してサインイン
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    alert("ログインに成功しました");
  } catch (error) {
    alert("ログインに失敗しました: " + error.message);
  }
});

// 予約フォームの要素を取得
const reservationForm = document.getElementById("reservation-form");
const dateInput = document.getElementById("date");
const siteSelect = document.getElementById("site");

// 日付が選択されたときに利用可能なキャンプサイトを取得
dateInput.addEventListener("change", async () => {
  const selectedDate = dateInput.value;

  // 使用可能なキャンプサイトをリセット
  siteSelect.innerHTML = '<option value="" disabled selected>キャンプサイトを選択してください</option>';

  // すべてのキャンプサイトを表示するための初期リスト
  const allSites = ["A-C", "D-F", "G-K"];

  try {
    // Firestoreから希望日に予約済みのキャンプサイトを取得
    const q = query(collection(db, "reservations"), where("date", "==", selectedDate));
    const querySnapshot = await getDocs(q);

    const reservedSites = [];
    querySnapshot.forEach((doc) => {
      reservedSites.push(doc.data().site);
    });

    // クエリ結果を確認（デバッグ用）
    console.log("予約済みのサイト:", reservedSites);

    // 予約済みでないキャンプサイトのみを選択肢に追加
    allSites.forEach((site) => {
      if (!reservedSites.includes(site)) {
        const option = document.createElement("option");
        option.value = site;
        option.textContent = site;
        siteSelect.appendChild(option);
      }
    });

    // すべてのサイトが予約済みの場合の処理
    if (siteSelect.options.length === 1) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "利用可能なキャンプサイトはありません";
      siteSelect.appendChild(option);
    }
  } catch (error) {
    console.error("キャンプサイトの取得中にエラーが発生しました:", error);
  }
});

// 予約フォームの送信イベントリスナー
reservationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = reservationForm["name"].value;
  const email = reservationForm["email"].value;
  const people = reservationForm["people"].value;
  const site = reservationForm["site"].value;
  const date = reservationForm["date"].value;

  try {
    // Firestoreに予約情報を保存
    await addDoc(collection(db, "reservations"), {
      name: name,
      email: email,
      people: people,
      site: site,
      date: date
    });
    alert("予約が完了しました！");
    reservationForm.reset();
  } catch (error) {
    alert("予約に失敗しました: " + error.message);
  }
});
