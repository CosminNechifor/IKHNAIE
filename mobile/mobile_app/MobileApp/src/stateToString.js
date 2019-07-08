stateNumberToText = (state) => {
    switch (state) {
      case 0: 
        return 'Editable';
      case 1: 
        return 'SubmitedForSale';
      case 2: 
        return 'Owned';
      case 3: 
        return 'Broken';
      case 4: 
        return 'NeedsRecycled';
      case 5: 
        return 'Recycled';
      case 6: 
        return 'Destroyed';
    }
}

export default stateNumberToText;