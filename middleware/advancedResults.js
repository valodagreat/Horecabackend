advancedResults = (model , populate) => async (req, res, next)=>{
    let query;

    //cloning request.query
    const reqQuery = {...req.query}

    //removing unwanted query params
    const removeField =['select','sort','page','limit']
    removeField.forEach(params=> delete reqQuery[params])

    //create query string
    let queryStr = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in)\b/g , match=> `$${match}`);
    
    //Finding Resources
    query = model.find(JSON.parse(queryStr));

    //select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }
    
    //sort fields
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else{
        query = query.sort('-createdAt')
    }

    //pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();
    
    //Executing query

    const pagination ={}

    if(endIndex<total){
        pagination.next ={
            page : page + 1,
            limit
        }
    }
    
    if(startIndex>0){
        pagination.prev ={
            page : page - 1,
            limit
        }
    }

    query= query.skip(startIndex).limit(limit);

    if (populate) {
        query = query.populate(populate)
    };

    const result = await query

    res.advancedResults = {
        success : true,
        count : result.length,
        pagination,
        data : result
    }

    next();
}

module.exports = advancedResults;