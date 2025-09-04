// Simple route helper function
window.route = function(name, params) {
    const routes = {
        'login': '/login',
        'logout': '/logout',
        'dashboard': '/dashboard',
        'leads.index': '/leads',
        'leads.create': '/leads/create',
        'leads.show': function(id) { return `/leads/${id}`; },
        'leads.edit': function(id) { return `/leads/${id}/edit`; },
        'leads.store': '/leads',
        'leads.update': function(id) { return `/leads/${id}`; },
        'leads.destroy': function(id) { return `/leads/${id}`; },
    };

    const route = routes[name];
    if (typeof route === 'function') {
        return route(params);
    }
    return route || '/';
};

export {};
