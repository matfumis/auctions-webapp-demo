const {createApp} = Vue

const app = createApp({

  data() {
    return {
      authenticated: false,
      userInfo: {},
      auctions: {},
      users: {},
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
      showLoginForm: false,
      showAuctionsFilters: false,
      auctionsQuery: '',
      usersQuery: ''
    }
  },

  mounted() {
    this.fetchUserInfo();
    this.fetchAuctions();
    // this.fetchUsers();
  },

  methods: {

    toggleLoginForm() {
      this.showLoginForm = !this.showLoginForm;
    },

    toggleAuctionsFilters() {
      this.showAuctionsFilters = !this.showAuctionsFilters;
    },

    emptyAuctionsQuery(){
      this.auctionsQuery = '';
    },

    emptyUsersQuery(){
      this.usersQuery = '';
    },

    signup: function () {
      fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.signupData)
      }).then(async res => {
        const message = await res.text();
        if (res.ok) {
          alert(message);
          // sarà da nascondere il form di sign up e lasciare solo quello di sign in
        } else {
          alert(message);
        }
      }).catch(err => {
        console.log(err);
      })

    },

    signin: function () {
      fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.signinData)
      }).then(async res => {
        const message = await res.text();
        if (res.ok) {
          this.authenticated = true;
          this.toggleLoginForm();
          alert(message);
        } else {
          alert(message);
        }
      }).catch(err => {
        console.log(err);
      })
    },

    signout: function () {
      fetch('/api/signout', {
        method: 'GET'
      }).then(async res => {
        const message = await res.text();
        if (res.ok) {
          this.authenticated = false;
          alert(message);
        } else {
          alert(message);
        }
      }).catch(err => {
        console.log(err);
      })
    },

    async fetchUserInfo() {
      fetch('/api/whoami', {
        method: 'GET',
        credentials: 'include' // Include i cookie nelle richieste
      }).then(async res => {
        if (res.ok) {
          this.authenticated = true;
          this.userInfo = await res.json();
        } else {
          this.authenticated = false;
          this.userInfo = {};
        }
      }).catch(err => {
        console.log(err);
      })
    },

    async fetchAuctions() {
      if (this.auctionsQuery === '') {
        fetch('/api/auctions', {
          method: 'GET'
        }).then(async res => {
          this.auctions = await res.json();
        }).catch(err => {
          console.log(err);
        })
      }
      else {
        fetch(`/api/auctions?q=${encodeURIComponent(this.auctionsQuery)}`, {
          method: 'GET'
        }).then(async res => {
          this.auctions = await res.json();
          this.emptyAuctionsQuery();
        }).catch(err => {
          console.log(err);
        })
      }
    },

    async fetchUsers() {
      if (this.usersQuery === '') {
        fetch('/api/users', {
          method: 'GET'
        }).then(async res => {
          this.users = await res.json();
        }).catch(err => {
          console.log(err);
        })
      }
      else {
        fetch(`/api/users?q=${encodeURIComponent(this.usersQuery)}`, {
          method: 'GET'
        }).then(async res => {
          this.users = await res.json();
          this.emptyUsersQuery();
        }).catch(err => {
          console.log(err);
        })
      }
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