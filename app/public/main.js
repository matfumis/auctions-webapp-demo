const { createApp } = Vue

const app = Vue.createApp({
  data() {
    return {
      authenticated: false,
      token: null,
      userInfo: {},
      loginData: {
        username: '',
        password: ''
      },
      signupData: {
        username: '',
        name: '',
        surname: '',
        password: ''
      },
      auctions: [],
      newAuction: {
        title: '',
        description: '',
        startPrice: '',
        endTime: ''
      },
      showLoginForm: false
    };
  },
  mounted() {
    // Controlla se l'utente è già autenticato
    this.checkAuthentication();
    // Carica subito l'elenco delle aste pubbliche
    this.fetchAuctions();
  },
  methods: {
    toggleLoginForm() {
      this.showLoginForm = !this.showLoginForm;
    },
    async signin() {
      try {
        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.loginData)
        });

        if (!response.ok){
          throw new Error('Login failed');
        }
        this.showLoginForm = false;
        await this.checkAuthentication();
        alert(response);
        await this.getUserInfo();
      } catch (error) {
        console.error('Login error:', error);
      }
    },
    async signup() {
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.signupData)
        });

        if (!response.ok) {
          throw new Error('Registration failed');
        }

        alert('Successfully registered, now you can log in');
      } catch (error) {
        console.error('Signup error:', error);
      }
    },
    async checkAuthentication() {
      try {
        const response = await fetch('/api/whoami', {
          method: 'GET',
          credentials: 'include' // Include i cookie nelle richieste
        });
        if (response.ok) {
          this.userInfo = await response.json();
          this.authenticated = true;
        } else {
          this.authenticated = false;
          this.userInfo = {};
        }
      } catch (error) {
        console.error('Error while checking authentication', error);
      }
    },
    async fetchAuctions() {
      try {
        const response = await fetch('/api/auctions', {
          method: 'GET'
        });
        if (!response.ok) throw new Error('Error while retrieving auctions');
        this.auctions = await response.json();
      } catch (error) {
        console.error('Error while retrieving auctions:', error);
      }
    },
    async createAuction() {
      try {
        const response = await fetch('/api/auctions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.newAuction)
        });
        if (!response.ok) throw new Error('Error while creating auction');
        const newAuction = await response.json();
        alert('Auction successfully created');
        this.auctions.push(newAuction);
      } catch (error) {
        console.error('Error while creating auction:', error);
      }
    },

  }
});

app.mount('#app');
