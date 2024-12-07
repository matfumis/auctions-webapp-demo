const { createApp } = Vue

const app = Vue.createApp({
  data() {
    return {
      authenticated: false,
      userInfo: {},
      signinData: {
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
      filters: {
        title: '',
        status: '',
        endTime:''
      },
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
    this.showUserInfo();
    // Carica subito l'elenco delle aste pubbliche
    this.fetchAuctions();
  },
  methods: {
    toggleLoginForm() {
      this.showLoginForm = !this.showLoginForm;
    },
  /*
    async signin() {
      try {
        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(this.signinData)
        });

        if (!response.ok) {
          throw new Error('Signin failed');
        }

        alert('Successfully signed in');
      } catch (error) {
        console.error('Signin error:', error);
      }
    },

   */
    signin() {
      fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // credentials: 'include', // Necessario per includere i cookie
        body: JSON.stringify({
          email: this.signinData.username,
          password: this.signinData.password,
        }),
      })
        .then(async response => {
          if (response.ok) {
            // Aggiorna lo stato dell'utente
            this.authenticated = true;

            alert('Login effettuato con successo!');
          } else {
            // Mostra un messaggio d'errore
            alert('Credenziali errate o login fallito.');
          }
        })
        .catch(error => {
          console.error('Errore durante il login:', error);
          alert('Errore durante il login.');
        });
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
    async showUserInfo() {
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

    async signout(){
        await fetch('/api/signout', {
          method : 'GET',
          credentials: 'include'
        })
          .then(response => {
            if (response.ok) {
              this.authenticated = false;
              this.userInfo = {};
            } else {
              console.error('Error while signing out');
            }
          })
          .catch(error => {
            console.error('Error while signing out', error);
          });
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-EN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },

  }
});

app.mount('#app');
