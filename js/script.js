var db; 

$(document).ready(function() {

	// Open Database
	var request = indexedDB.open("customerManager1", 1); 

	// Provide the callbacks

	// Success
	request.onsuccess = function(e) {
		console.log("Success: Opened Database...");
		db = e.target.result; 
		// Show customers
		showCustomers(); 
	};

	// Fail
	request.onerror = function(e) {
		console.log("error: Can't Open the Database");
	};

    // Create or update teh database
	request.onupgradeneeded = function(e) {
		var db = e.target.result; 
		if(!db.objectStoreNames.contains("customers")) {
			var os = db.createObjectStore("customers", {keyPath: "id", autoIncrement:true});
			os.createIndex('name', 'name', {unique:false});
		}
	};
})

function showCustomers() {

	var tx = db.transaction(["customers"], "readwrite");
	var store = tx.objectStore("customers");
	var index = store.index("name");
	var output = ""; 


	index.openCursor().onsuccess = function(e) {
		var cursor = e.target.result;
		if (cursor) {
			output += 	"<tr id='customer" 	+ cursor.value.id 		+ "'>" 														+
							"<td>" 		 	+ cursor.value.id 		+ "</td>" 			+ 
							"<td><span class='editable' contenteditable='true' data-field='name' data-id='" + 
							cursor.value.id 	+ "'>"	+ 
							cursor.value.name 	+ "</span></td>" 	+ 
							"<td><span class='editable' contenteditable='true' data-field='email' data-id='" + 
							cursor.value.id 	+ "''>" 	+ 
							cursor.value.email 	+ "</span></td>"	+ 
							"<td><a href='' onclick='removeCustomer("   +  cursor.value.id 	+ 
							")'>Delete</a></td>"	+ 
						"</tr>";

			cursor.continue();
		}
		$("#customers").html(output);
	};
}

function addCustomer() {

	var name = $("#name").val(); 
	var email = $("#email").val(); 

	var tx = db.transaction(["customers"], "readwrite");
	var store = tx.objectStore("customers");

	var customer = {
		name: name, 
		email: email
	}; 

	var req = store.add(customer); 

	req.onsuccess = function(e) {
		location.href="index.html";
	}; 

	req.onerror = function(e) {
		alert("Error: Can't add to the Database"); 
		console.log("error:", e.target.error.name); 
	}

}

function removeAllCustomers() {
	indexedDB.deleteDatabase("customerManager1"); 
}

function removeCustomer(id) {
	var tx = db.transaction(["customers"], "readwrite");
	var store = tx.objectStore("customers");
	var req = store.delete(id); 

	req.onsuccess = function(e) {
		console.log("Customer "+id+ "Deleted" );
		$("#customer"+id).remove();
	}

	req.onerror = function(e) {
		alert("Error: Can't delete from the Database"); 
		console.log("error:", e.target.error.name); 
	}

}

// Update Customer 
$('#customers').on('blur', ".editable", function() {
	var newText = $(this).html(); 
	var field = $(this).data('field'); 
	var id = $(this).data('id'); 

	var tx = db.transaction(["customers"], "readwrite");
	var store = tx.objectStore("customers");
	var req = store.get(id); 

	req.onsuccess = function() {
		var data = req.result; 
		if(field == 'name') {
			data.name = newText; 
		} else if (field == 'email') {
			data.email = newText; 
		}

		var reqUpdate = store.put(data); 

		reqUpdate.onsuccess = function () {
			console.log("Sucess: Customer data updated");
		}

		reqUpdate.onerror = function () {
			console.log("Error: Customer data not updated");
		}
	}
})