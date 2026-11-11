/*
  ==========================================================================
   MY JOURNAL — everything shown on the Journal page comes from this file.
  ==========================================================================

  TO WRITE A NEW POST
  Copy the block below (from its opening "{" to its closing "},"), paste it
  at the TOP of the "posts" list, and change the words inside the quotes.
  Save the file and publish. The newest post goes first.

        {
            id: "my-new-post",                 a short name with no spaces (used in the link)
            date: "2026-11-20",                year-month-day
            tag: "Books",                      one word: Travel, Books, Thoughts ... anything
            title: "The heading of the post",
            text: [
                "First paragraph.",
                "Second paragraph.",
            ],
        },

  TO ADD PHOTOS TO A POST
  Put the photos in a folder inside "journal/photos/", then add these two lines to the post:

            folder: "journal/photos/my-folder/",
            photos: ["first.jpg", "second.jpg"],

  To add more photos later, drop them in the same folder and add their names to the list.
  Photos straight from a phone are very large; shrink them to about 2000 px wide first.

  Rules that keep it working:
    - Keep the quotes around text and the comma after every line and every "}".
    - If your text has a double quote in it, write \" instead of ".
    - A trip over several days can use  date: "2025-12-30", to: "2026-01-02",
*/

window.JOURNAL = {

    // The link used for the Goodreads card
    goodreads: "https://www.goodreads.com/jobayerx",
    goodreadsId: "203306973",

    // The map of districts visited. To update it, replace the image file and change the caption.
    map: {
        image: "journal/photos/bangladesh-map.jpg",
        caption: "29 of 64 districts, across all 8 divisions.",
    },

    posts: [
        {
            id: "saint-martin-2025",
            date: "2025-12-30",
            to: "2026-01-02",
            tag: "Travel",
            title: "Saint Martin's Island",
            text: [
                "Spent the last days of 2025 and the first days of 2026 on Saint Martin's, Bangladesh's only coral island.",
                "Ferry rides over the Bay of Bengal, moon-shaped fishing boats with bright flags, and quiet hours on the coral rocks by the water. A few photos for now, more to come.",
            ],
            folder: "journal/photos/saint-martin/",
            photos: ["shore.jpg", "ferry.jpg", "moon-boat.jpg"],
        },
    ],
};
