function calculateTax(amount, taxRate) {
    var tax = amount * taxRate;
    return amount + tax;
}

module.exports = calculateTax;
