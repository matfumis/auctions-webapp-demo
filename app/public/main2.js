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
      newAuction: {
        title: '',
        description: '',
        startPrice: '',
        endTime: ''
      },
      newBid: {
        amount: '0'
      },
      auctionsQuery: '',
      usersQuery: '',
      selectedAuction: '',

      showLoginForm: false,
      showAuctionsFilters: false,
      showNewAuctionForm: false,
      showNewBidForm: false,
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

    toggleNewAuctionForm() {
      this.showNewAuctionForm = !this.showNewAuctionForm;
    },

    toggleNewBidForm(auctionId) {
      this.selectedAuction = this.selectedAuction === auctionId ? null : auctionId;
    },

    emptyAuctionsQuery() {
      this.auctionsQuery = '';
    },

    emptyUsersQuery() {
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
          this.signupData = ''
        } else {
          alert(message);
          this.signupData = ''
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
          this.signinData = '';
          alert(message);
        } else {
          alert(message);
          this.signinData = '';
        }
      }).catch(err => {
        console.log(err);
      })
    },

    signout: function () {
      fetch('/api/signout', {
        method: 'GET',
        credentials: 'include'
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
        credentials: 'include'
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
      } else {
        fetch(`/api/auctions?q=${encodeURIComponent(this.auctionsQuery)}`, {
          method: 'GET'
        }).then(async res => {
          this.auctions = await res.json();
          this.emptyAuctionsQuery();
        }).catch(err => {
          console.log(err);
        });
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
        });
      } else {
        fetch(`/api/users?q=${encodeURIComponent(this.usersQuery)}`, {
          method: 'GET'
        }).then(async res => {
          this.users = await res.json();
          this.emptyUsersQuery();
        }).catch(err => {
          console.log(err);
        });
      }
    },

    createAuction() {
      fetch('/api/auctions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.newAuction)
      }).then(async res => {
        const message = await res.text();
        if (res.ok) {
          alert(message);
          // this.newAuction = await res.json();
          await this.fetchAuctions();
          this.toggleNewAuctionForm();
        } else {
          alert(message);
        }
      }).catch(err => {
        console.log(err);
      });
    },

    makeNewBid() {
      fetch(`/api/auctions/${encodeURIComponent(this.selectedAuction)}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(this.newBid)
      }).then(async res => {
        const message = await res.text();
        if (res.ok) {
          alert(message);
          this.toggleNewBidForm();
          this.newBid = '0';
          await this.fetchAuctions();
        } else {
          alert(message);
          this.newBid = '0';
          await this.fetchAuctions();
        }
      }).catch(err => {
        console.log(err);
      })
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

    isAuctionOpen(date) {
      const now = new Date();
      const endTime = new Date(date);
      return now < endTime;
    },

  }
});

app.mount('#app');