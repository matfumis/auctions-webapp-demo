const { createApp } = Vue;

const app = createApp({

  data() {
    return {
      authenticated: false,
      userInfo: {},
      auctions: {},
      users: {},
      userCreatedAuctions: {},
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
      editedAuction: {
        title: '',
        description: '',
      },
      newBid: {
        amount: ''
      },

      auctionsQuery: '',
      onlyOpenAuctions: false,
      usersQuery: '',
      selectedAuction: '',
      selectedUserId: '',

      showAuctionsFilters: false,
      showNewAuctionForm: false,
      showNewBidForm: false,
      showMoreUserInfo: false,
      showBidsHistory: false,
      showEditAuctionForm: false,
      showSignupForm: false,
      showUserCreatedAuctions: false,

      showPersonalArea: false,
      showAuctionsArea: true,
      showUsersArea: false,
    }
  },

  mounted() {
    this.fetchUserInfo();
    this.fetchAuctions();
  },

  methods: {

    toggleLoginForm() {
      this.showLoginForm = !this.showLoginForm;
    },

    toggleNewAuctionForm() {
      this.showNewAuctionForm = !this.showNewAuctionForm;
      this.showUserCreatedAuctions = false;
    },

    toggleUserCreatedAuctions() {
      this.showUserCreatedAuctions = !this.showUserCreatedAuctions;
      this.showNewAuctionForm = false;
      this.fetchUserCreatedAuctions();
    },

    toggleBidsHistory(auctionId) {
      if (this.selectedAuction === auctionId && this.showBidsHistory) {

        this.showBidsHistory = false;
        this.selectedAuction = null;
      } else {

        this.showBidsHistory = true;
        this.showNewBidForm = false;
        this.selectedAuction = auctionId;
      }
    },

    toggleEditAuctionForm(auctionId) {
      if (this.selectedAuction === auctionId && this.showEditAuctionForm) {

        this.showEditAuctionForm = false;
        this.selectedAuction = null;
      } else {

        this.showEditAuctionForm = true;
        this.selectedAuction = auctionId;
      }
    },

    toggleNewBidForm(auctionId) {
      if (this.selectedAuction === auctionId && this.showNewBidForm) {

        this.showNewBidForm = false;
        this.selectedAuction = null;
      } else {

        this.showNewBidForm = true;
        this.showBidsHistory = false;
        this.selectedAuction = auctionId;
      }
    },

    togglePersonalArea() {
      this.showPersonalArea = true 
      this.showUsersArea = false;
      this.showAuctionsArea = false;
    },

    toggleAuctionsArea() {
      this.showAuctionsArea = true
      this.showUsersArea = false;
      this.showPersonalArea = false;
    },

    toggleUsersArea() {
      this.showUsersArea = true;
      this.showPersonalArea = false;
      this.showAuctionsArea = false;
    },

    toggleMoreUserInfo(userId) {
      this.selectedUserId = this.selectedUserId === userId ? null : userId;
    },

    toggleSignupForm() {
      this.showSignupForm = !this.showSignupForm;
    },

    async signup() {
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.signupData)
        });
        const { msg } = await res.json();
        if (res.ok) {
          Swal.fire({
            Title: 'Success!',
            icon: 'success',
            text: msg,
            confirmButtonText: 'Ok'
          });
          this.showSignupForm = false;
          this.signupData = {};
        } else {
          Swal.fire({
            Title: 'Oops!',
            icon: 'error',
            text: msg,
            confirmButtonText: 'Ok'
          });
          this.signupData = {};
        }
      } catch (err) {
        console.log(err);
        this.signupData = {};
      }
    },

    async signin() {
      try {
        const res = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.signinData)
        });
        const { msg } = await res.json();
        if (res.ok) {
          this.authenticated = true;
          this.toggleLoginForm();
          this.signinData = {};
          Swal.fire({
            title: 'Success!',
            icon: 'success',
            text: msg,
            showConfirmButton: false,
          });
          await new Promise(resolve => setTimeout(resolve, 1300));
          window.location.href = "/";
        } else {
          Swal.fire({
            title: 'Oops!',
            icon: 'error',
            text: msg,
            confirmButtonText: 'Ok'
          });
          this.signinData = {};
        }
      } catch (err) {
        console.log(err);
        this.signinData = {};
      }
    },

    async fetchUserInfo() {
      try {
        const res = await fetch('/api/whoami', {
          method: 'GET',
          credentials: 'include'
        });
        if (res.ok) {
          this.authenticated = true;
          this.userInfo = await res.json();
        } else {
          this.authenticated = false;
          this.userInfo = {};
        }
      } catch (err) {
        console.log(err);
        this.authenticated = false;
        this.userInfo = {};
      }

    },

    async fetchAuctions() {
      try {
        if (this.auctionsQuery === '') {
          const res = await fetch('/api/auctions', {
            method: 'GET'
          });
          let data = await res.json();
          if (this.onlyOpenAuctions) {
            this.auctions = data.filter(auction => auction.open === true);
          } else {
            this.auctions = data;
          }
        }
        else {
          const res = await fetch(`/api/auctions?q=${encodeURIComponent(this.auctionsQuery)}`, {
            method: 'GET'
          });
          let data = await res.json();
          if (this.onlyOpenAuctions) {
            this.auctions = data.filter(auction => auction.open === true);
            this.auctionsQuery = '';
          } else {
            this.auctions = data;
            this.auctionsQuery = '';
          }
        }
      } catch (err) {
        console.log(err);
      }
    },

    async fetchUserCreatedAuctions() {
      const res = await fetch(`/api/auctions?q=${encodeURIComponent(this.userInfo.id)}`, {
        method: 'GET'
      });
      this.userCreatedAuctions = await res.json();
      this.fetchAuctions();
    },

    async fetchUsers() {
      try {
        if (this.usersQuery.trim() === '') {
          const res = await fetch('/api/users', {
            method: 'GET'
          });
          this.users = await res.json();
        } else {
          const res = await fetch(`/api/users?q=${encodeURIComponent(this.usersQuery)}`, {
            method: 'GET'
          });
          this.users = await res.json();
          this.usersQuery = '';
        }
      } catch (err) {
        console.log(err);
      }
    },

    async createAuction() {
      try {
        const res = await fetch('/api/auctions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(this.newAuction)
        });
        const { msg } = await res.json();
        if (res.ok) {
          Swal.fire({
            title: 'Success!',
            icon: 'success',
            text: msg,
            confirmButtonText: 'Ok'
          });
          await this.fetchAuctions();
          this.toggleNewAuctionForm();
          this.newAuction = {};
        } else {
          Swal.fire({
            title: 'Oops!',
            icon: 'error',
            text: msg,
            confirmButtonText: 'Ok'
          });
        }
      } catch (err) {
        console.log(err);
      }
    },

    async deleteAuction(id) {
      try {
        const res = await fetch(`/api/auctions/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        const { msg } = await res.json();
        if (res.ok) {
          Swal.fire({
            title: 'Success!',
            icon: 'success',
            text: msg,
            confirmButtonText: 'Ok'
          });
          await this.fetchUserCreatedAuctions();
        } else {
          Swal.fire({
            title: 'Oops!',
            icon: 'error',
            text: msg,
            confirmButtonText: 'Ok'
          });
        }
      } catch (err) {
        console.log(err);
      }
    },

    async editAuction(id) {
      try {
        const res = await fetch(`/api/auctions/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(this.editedAuction)
        });
        const { msg } = await res.json();
        if (res.ok) {
          await this.fetchUserCreatedAuctions();
          Swal.fire({
            title: 'Success!',
            icon: 'success',
            text: msg,
            confirmButtonText: 'Ok'
          });
          this.toggleEditAuctionForm(id);
        } else {
          Swal.fire({
            title: 'Oops!',
            icon: 'error',
            text: msg,
            confirmButtonText: 'Ok'
          });
        }
      } catch (err) {
        console.log(err);
      }
    },

    async makeNewBid() {
      try {
        const res = await fetch(`/api/auctions/${encodeURIComponent(this.selectedAuction)}/bids`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(this.newBid)
        });
        const { msg } = await res.json();
        if (res.ok) {
          Swal.fire({
            title: 'Success!',
            icon: 'success',
            text: msg,
            confirmButtonText: 'Ok'
          });
          this.toggleNewBidForm();
          this.newBid.amount = '';
          await this.fetchAuctions();
        } else {
          Swal.fire({
            title: 'Oops!',
            icon: 'error',
            text: msg,
            confirmButtonText: 'Ok'
          });
          this.newBid.amount = '';
          await this.fetchAuctions();
        }
      } catch (err) {
        console.log(err);
      }
    },

    async signout() {
      try {
        const res = await fetch(`api/signout`, {
          method: 'POST',
          credentials: 'include'
        });
        const {msg} = await res.json();
        if (res.ok) {
          this.userInfo = {};
          this.authenticated = false;
          Swal.fire({
            title: 'Success!',
            icon: 'success',
            text: msg,
            showConfirmButton: false
          });
          await new Promise(resolve => setTimeout(resolve, 1300));
          window.location.href = "/";
        }
        else {
          Swal.fire({
            title: 'Oops!',
            icon: 'error',
            text: msg,
            confirmButtonText: 'Ok'
          });
        }
      } catch (err) {
        console.log(err);
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('en-EN', {
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

    printStatus(status) {
      return {
        text: status ? 'open' : 'expired',
        color: status ? 'green' : 'red',
      };
    },

    printWinner(winner, seller, isOpen) {
      try {
        if (!winner && isOpen) {
          return 'nobody yet';
        }
        if ((!winner || winner === seller) && !isOpen) {
          return 'nobody';
        }
        else {
          return winner;
        }
      }
      catch {
        console.log(err);
      }
    }
  }
});

app.mount('#app');