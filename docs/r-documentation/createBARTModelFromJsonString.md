# Convert a JSON string containing sample information on a trained BART model

## Description

Convert a JSON string containing sample information on a trained BART model
to a BART model object which can be used for prediction, etc...

## Usage

```r
createBARTModelFromJsonString(json_string)
```

## Arguments

* `json_string`: JSON string dump

## Value

Object of type `bartmodel`

## Examples

```r
n <- 100
p <- 5
X <- matrix(runif(n*p), ncol = p)
f_XW <- (
    ((0 <= X[,1]) & (0.25 > X[,1])) * (-7.5) + 
    ((0.25 <= X[,1]) & (0.5 > X[,1])) * (-2.5) + 
    ((0.5 <= X[,1]) & (0.75 > X[,1])) * (2.5) + 
    ((0.75 <= X[,1]) & (1 > X[,1])) * (7.5)
)
noise_sd <- 1
y <- f_XW + rnorm(n, 0, noise_sd)
test_set_pct <- 0.2
n_test <- round(test_set_pct*n)
n_train <- n - n_test
test_inds <- sort(sample(1:n, n_test, replace = FALSE))
train_inds <- (1:n)[!((1:n) %in% test_inds)]
X_test <- X[test_inds,]
X_train <- X[train_inds,]
y_test <- y[test_inds]
y_train <- y[train_inds]
bart_model <- bart(X_train = X_train, y_train = y_train)
# bart_json <- saveBARTModelToJsonString(bart_model)
# bart_model_roundtrip <- createBARTModelFromJsonString(bart_json)
# y_hat_mean_roundtrip <- rowMeans(predict(bart_model_roundtrip, X_train)$y_hat)
# plot(rowMeans(bart_model$y_hat_train), y_hat_mean_roundtrip, 
#      xlab = "original", ylab = "roundtrip")
```
